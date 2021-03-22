import React, { useState } from "react";

import { Alert, Image, Menu, Dropdown } from "antd";

import { ListTokenModal, PlaceBidModal, PurchaseTokenModal, UnlistTokenModal } from "./modals";
import { FormatAddress } from "../helpers";
import { useContractReader } from "../hooks";
import { NULL_ADDRESS } from "../constants";

import web3 from "web3";

const KEY_LIST_FOR_SALE = "1";
const KEY_UNLIST_FROM_MARKETPLACE = "2";
const KEY_PURCHASE_FULL_PRICE = "3";
const KEY_PLACE_BID = "4";
const KEY_VIEW_BIDS = "5";
const KEY_VIEW_TX_HISTORY = "6";

// TODO(bingbongle) validation, loading spinner, etc.s
// TODO(bingbongle) donation amount
export default function Token({
  address,
  contracts,
  imageUrl,
  pageId,
  pageTitle,
  transactor,
  signer,
}) {
  // Modal state
  const [listTokenModalVisible, setListTokenModalVisible] = useState(false);
  const [unlistTokenModalVisible, setUnlistTokenModalVisible] = useState(false);
  const [purchaseFullPriceModalVisible, setPurchaseFullPriceModalVisible] = useState(false);
  const [placeBidModalVisible, setPlaceBidModalVisible] = useState(false);

  // Form state
  const [listTokenPriceInEth, setListTokenPriceInEth] = useState("1");
  const [bidPriceInEth, setBidPriceInEth] = useState("1");

  // Poll the owner of this token.
  const owner = useContractReader(contracts, "Token", "pageIdToAddress", [pageId]);

  // Poll offer belonging to this token.
  const offer = useContractReader(
    contracts,
    "Token",
    "pagesOfferedForSale",
    [pageId],
    10000,
    newOffer => {
      return {
        isForSale: newOffer[0],
        price: web3.utils.fromWei(newOffer.minValue.toString(), "ether"),
        seller: newOffer[2],
      };
    },
  );

  // Poll outstanding bid belonging to this token.
  const bid = useContractReader(contracts, "Token", "pageBids", [pageId], 10000, newBid => {
    return newBid
      ? {
          bidder: newBid.bidder,
          hasBid: newBid.hasBid,
          value: web3.utils.fromWei(newBid.value.toString(), "ether"),
        }
      : undefined;
  });

  // Poll donation amount required for this token
  const donationAmount = useContractReader(contracts, "Token", "calculateDonationFromValue", [
    web3.utils.toWei(offer && offer.price ? offer.price.toString() : "0", "ether"),
  ]);

  // Creates a Menu.Item for token action menu.
  const menuItem = (key, emoji, emojiText, label) => {
    return (
      <Menu.Item key={key}>
        <span role="img" aria-label={emojiText}>
          {emoji}
        </span>{" "}
        {label}
      </Menu.Item>
    );
  };

  // Builds the right-click menu with user options to interact with token. Varies depending on user
  // and token state.
  const menu = () => {
    if (!offer || !owner || !address) {
      return <Menu />;
    }
    let items = [];
    if (owner === address) {
      if (offer.isForSale) {
        items.push(menuItem(KEY_UNLIST_FROM_MARKETPLACE, "🛌", "bed", "Unlist from marketplace"));
      } else {
        items.push(menuItem(KEY_LIST_FOR_SALE, "🎉", "party", "List for sale"));
      }
    } else {
      if (offer.isForSale) {
        items.push(menuItem(KEY_PURCHASE_FULL_PRICE, "🔥", "fire", "Purchase for full price"));
      }
      if (owner !== NULL_ADDRESS) {
        items.push(menuItem(KEY_PLACE_BID, "🤠", "cowboy", "Bid on page"));
      }
    }
    items.push(menuItem(KEY_VIEW_BIDS, "⚖️", "scale", "View outstanding bids"));
    items.push(menuItem(KEY_VIEW_TX_HISTORY, "🌐", "globe", "View history"));
    return <Menu onClick={handleMenuClick}>{items}</Menu>;
  };

  /**
   * Opens the tokens corresponding Wikipedia. Inteded to be triggered when the
   * image is (left) clicked.
   */
  const openWikipediaPage = () => {
    window.open(`https://en.wikipedia.org/?curid=${pageId}`);
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
          .add(web3.utils.toBN(donationAmount.toString()))
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
   * Triggered when a right-click menu item is selected.
   * @param {*} event On click event.
   */
  function handleMenuClick(event) {
    switch (event.key) {
      case KEY_LIST_FOR_SALE:
        setListTokenModalVisible(true);
        break;
      case KEY_UNLIST_FROM_MARKETPLACE:
        setUnlistTokenModalVisible(true);
        break;
      case KEY_PURCHASE_FULL_PRICE:
        setPurchaseFullPriceModalVisible(true);
        break;
      case KEY_PLACE_BID:
        setPlaceBidModalVisible(true);
        break;
      default:
        console.log(`Event not handled!`, event);
    }
  }

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
        {donationAmount && offer && (
          <div>
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
            <PurchaseTokenModal
              pageTitle={pageTitle}
              offer={offer}
              donationAmount={donationAmount}
              visible={purchaseFullPriceModalVisible}
              onOk={() => {
                setPurchaseFullPriceModalVisible(false);
                purchaseForFullPrice();
              }}
              onCancel={() => {
                setPurchaseFullPriceModalVisible(false);
              }}
            />
            {bid && (
              <PlaceBidModal
                pageTitle={pageTitle}
                donationAmount={donationAmount}
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
            )}
          </div>
        )}
      </div>
    </Dropdown>
  );
}
