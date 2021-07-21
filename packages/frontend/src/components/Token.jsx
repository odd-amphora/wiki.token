import React, { useState } from "react";

import { Alert, Image, Menu, Dropdown } from "antd";
import { BigNumber } from "@ethersproject/bignumber";

import { FormatAddress } from "../helpers";
import { useContractReader, useEventListener } from "../hooks";
import { NULL_ADDRESS } from "../constants";

import web3 from "web3";

const KEY_LIST_FOR_SALE = "1";
const KEY_UNLIST_FROM_MARKETPLACE = "2";
const KEY_PURCHASE_FULL_PRICE = "3";
const KEY_PLACE_BID = "4";
const KEY_VIEW_TX_HISTORY = "5";
const KEY_ACCEPT_BID = "6";
const KEY_WITHDRAW_BID = "7";

// TODO(bingbongle) validation, loading spinner, etc.s
// TODO(bingbongle) donation amount
export default function Token({
  address,
  contracts,
  imageUrl,
  localProvider,
  pageId,
  pageTitle,
  signer,
  transactor,
}) {
  // Poll the owner of this token.
  const owner = useContractReader(contracts, "Token", "pageIdToAddress", [pageId]);

  /**
   * Opens the tokens corresponding Wikipedia. Inteded to be triggered when the
   * image is (left) clicked.
   */
  const openWikipediaPage = () => {
    window.open(`https://en.wikipedia.org/?curid=${pageId}`);
  };

  /**
   * Acceps the outstanding token bid.
   */
  const acceptBid = async () => {
    await transactor(
      contracts["Token"]
        .connect(signer)
        ["acceptBidForPage"](pageId, web3.utils.toWei(bid.value, "ether")),
    );
  };

  /**
   * Lists the token for sale on the marketplace.
   */
  const listToken = async () => {
    await transactor(
      contracts["Token"]
        .connect(signer)
        ["offerPageForSale"](pageId, web3.utils.toWei(listTokenPriceInEth, "ether")),
    );
  };

  /**
   * Unlists token from marketplace.
   */
  const unlistToken = async () => {
    await transactor(contracts["Token"].connect(signer)["pageNoLongerForSale"](pageId));
  };

  /**
   * Purchase token for full price.
   */
  const purchaseForFullPrice = async () => {
    await transactor(
      contracts["Token"].connect(signer)["buyPage"](pageId, {
        // TODO(bingbongle): this doesn't work
        value: web3.utils
          .toBN(web3.utils.toWei(offer.price, "ether"))
          .add(web3.utils.toBN(offerDonationAmount.toString()))
          .toString(),
      }),
    );
  };

  /**
   * Places a bid against the token.
   */
  const placeBid = async () => {
    await transactor(
      contracts["Token"].connect(signer)["enterBidForPage"](pageId, {
        value: web3.utils.toBN(web3.utils.toWei(bidPriceInEth, "ether")).toString(),
      }),
    );
  };

  /**
   * Withdraws the current address's bid against this token, assuming the open bid
   * belongs to them.
   */
  const withdrawBid = async () => {
    await transactor(contracts["Token"].connect(signer)["withdrawBidForPage"](pageId));
  };

  /**
   * Triggered when a right-click menu item is selected.
   * @param {*} event On click event.
   */
  function handleMenuClick(event) {
    switch (event.key) {
      case KEY_ACCEPT_BID:
        setAcceptBidModalVisible(true);
        break;
      case KEY_LIST_FOR_SALE:
        setListTokenModalVisible(true);
        break;
      case KEY_PURCHASE_FULL_PRICE:
        setPurchaseFullPriceModalVisible(true);
        break;
      case KEY_PLACE_BID:
        setPlaceBidModalVisible(true);
        break;
      case KEY_VIEW_TX_HISTORY:
        setTxHistoryModalVisible(true);
        break;
      case KEY_UNLIST_FROM_MARKETPLACE:
        setUnlistTokenModalVisible(true);
        break;
      case KEY_WITHDRAW_BID:
        setWithdrawBidModalVisible(true);
        break;
      default:
        console.log(`Event not handled!`, event);
    }
  }

  // Asynchronously fetch and sort transaction history associated with this token.
  fetchAndSortTxHistoryEvents();

  return (
    <Dropdown overlay={menu()} trigger={["contextMenu"]}>
      <div className="token">
        {offer && offer.isForSale && (
          <Alert message={"💸  " + offer.price + " ETH"} type={"success"} />
        )}
        {bid && bid.hasBid && (
          <Alert message={"Open bid for " + bid.value + " ETH"} type="success" />
        )}
        <div className="token-wrapper">
          <div className="token-image">
            <Image
              width={196}
              src={imageUrl}
              preview={false}
              onClick={() => {
                openWikipediaPage();
              }}
            />
          </div>
          <div className="token-text-box">
            <div className="token-page-title">{`"${pageTitle}"`}</div>
            <div className="token-page-id">{pageId}</div>
          </div>
        </div>
        {owner && address && owner !== NULL_ADDRESS && (
          <div className="token-owner">
            {owner === address ? `😎 You own this token` : FormatAddress(owner)}
          </div>
        )}
        {/* Token action modals */}
        {/* This should be wrapped in some isModalReady property, probably */}
        {bid && bidDonationAmountWei && offerDonationAmount && offer && (
          <div>
            <AcceptBidModal
              value={bid.value}
              donationAmountWei={bidDonationAmountWei}
              pageTitle={pageTitle}
              visible={acceptBidModalVisible}
              onOk={() => {
                setAcceptBidModalVisible(false);
                acceptBid();
              }}
              onCancel={() => {
                setAcceptBidModalVisible(false);
              }}
            />
            <ListTokenModal
              pageTitle={pageTitle}
              visible={listTokenModalVisible}
              onOk={() => {
                setListTokenModalVisible(false);
                listToken();
              }}
              onCancel={() => {
                setListTokenModalVisible(false);
              }}
              onListPriceChange={e => {
                setListTokenPriceInEth(e.toString());
              }}
            />
            <PurchaseTokenModal
              pageTitle={pageTitle}
              offer={offer}
              donationAmount={offerDonationAmount}
              visible={purchaseFullPriceModalVisible}
              onOk={() => {
                setPurchaseFullPriceModalVisible(false);
                purchaseForFullPrice();
              }}
              onCancel={() => {
                setPurchaseFullPriceModalVisible(false);
              }}
            />
            <PlaceBidModal
              pageTitle={pageTitle}
              donationAmount={offerDonationAmount}
              visible={placeBidModalVisible}
              bid={bid}
              onOk={() => {
                placeBid();
                setPlaceBidModalVisible(false);
              }}
              onCancel={() => {
                setPlaceBidModalVisible(false);
              }}
              onBidAmountChanged={e => {
                setBidPriceInEth(e.toString());
              }}
            />
            <TxHistoryModal
              pageTitle={pageTitle}
              visible={txHistoryModalVisible}
              events={txHistoryEvents}
              onOk={() => {
                setTxHistoryModalVisible(false);
              }}
              onCancel={() => {
                setTxHistoryModalVisible(false);
              }}
            />
            <UnlistTokenModal
              pageTitle={pageTitle}
              visible={unlistTokenModalVisible}
              onOk={() => {
                setUnlistTokenModalVisible(false);
                unlistToken();
              }}
              onCancel={() => {
                setListTokenModalVisible(false);
              }}
            />
            <WithdrawBidModal
              pageTitle={pageTitle}
              visible={withdrawBidModalVisible}
              onOk={() => {
                setWithdrawBidModalVisible(false);
                withdrawBid();
              }}
              onCancel={() => {
                setWithdrawBidModalVisible(false);
              }}
            />
          </div>
        )}
      </div>
    </Dropdown>
  );
}
