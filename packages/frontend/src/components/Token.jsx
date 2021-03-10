import React, { useState } from "react";

import { BigNumber } from "@ethersproject/bignumber";
import { Alert, Image, InputNumber, Modal, Menu, Dropdown } from "antd";

import { FormatAddress } from "../helpers";
import { useContractReader } from "../hooks";

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
  const [acceptBidModalVisible, setAcceptBidModalVisible] = useState(false);
  const [viewTxHistoryModalVisible, setViewTxHistoryModalVisible] = useState(false);

  // Form state
  const [listTokenPriceInEth, setListTokenPriceInEth] = useState("1");

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
      return newOffer && newOffer.length >= 5
        ? {
            isForSale: newOffer[0],
            price: web3.utils.fromWei(newOffer.minValue.toString(), "ether"),
            seller: newOffer[2],
          }
        : null;
    },
  );

  // Builds the right-click menu with user options to interact with token. Varies depending on user
  // and token state.
  const menu = () => {
    if (!offer || !owner || !address) {
      return <Menu />;
    }
    let items = [];
    if (owner === address) {
      // List page for sale
      if (!offer.isForSale) {
        items.push(<Menu.Item key={KEY_LIST_FOR_SALE}>🎉 List for sale</Menu.Item>);
      }
      // Take page off market
      if (offer.isForSale) {
        items.push(
          <Menu.Item key={KEY_UNLIST_FROM_MARKETPLACE}>🛌 Unlist from marketplace</Menu.Item>,
        );
      }
    } else {
      // Purchase page for full price
      if (offer.isForSale) {
        items.push(<Menu.Item key={KEY_PURCHASE_FULL_PRICE}>🔥 Purchase for full price</Menu.Item>);
      }
      // Place bid on item
      if (offer.isForSale) {
        items.push(<Menu.Item key={KEY_PLACE_BID}>🤠 Bid on page</Menu.Item>);
      }
    }
    // View bids
    items.push(<Menu.Item key={KEY_VIEW_BIDS}>⚖️ View outstanding bids</Menu.Item>);
    // View page history
    items.push(<Menu.Item key={KEY_VIEW_TX_HISTORY}>🌐 View history</Menu.Item>);
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
      contracts["Token"]
        .connect(signer)
        ["buyPage"](pageId, { value: web3.utils.toWei(offer.price, "ether") }),
    );
  };

  /**
   * Places a bid against the token.
   */
  const placeBid = async () => {
    // TODO(bingbongle) Implement.
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
      default:
        console.log(`Event not handled!`, event);
    }
  }

  return (
    <Dropdown overlay={menu()} trigger={["contextMenu"]}>
      <div className="token">
        <Alert
          message={
            offer && offer.isForSale === true ? "💸  " + offer.price + " ETH" : "🤷  Not listed"
          }
          type={offer && offer.isForSale === true ? "success" : "warning"}
        />
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
        <div className="token-owner">
          {owner && address && owner === address ? `😎 You own this token` : FormatAddress(owner)}
        </div>
        <Modal
          title={`List "` + pageTitle + `" for sale`}
          visible={listTokenModalVisible}
          onOk={() => {
            setListTokenModalVisible(false);
            listToken();
          }}
          onCancel={() => setListTokenModalVisible(false)}
        >
          <p>
            By listing this page, buyers will be able to purchase it outright without placing a bid.
          </p>
          <p>You can unlist this page at any time.</p>
          <InputNumber
            style={{
              width: 200,
            }}
            size="large"
            defaultValue="1"
            formatter={value => `$ ${value}`.replace(/[^0-9.]/g, "")}
            parser={value => `$ ${value}`.replace(/[^0-9.]/g, "")}
            min="0"
            step="0.0000001"
            stringMode
            preserve={false}
            onChange={e => {
              setListTokenPriceInEth(e.toString());
            }}
          />{" "}
          ETH
          <br />
        </Modal>
        <Modal
          title={`Unlist "` + pageTitle + `" from marketplace`}
          visible={unlistTokenModalVisible}
          onOk={() => {
            setUnlistTokenModalVisible(false);
            unlistToken();
          }}
          onCancel={() => setUnlistTokenModalVisible(false)}
        >
          <p>
            Buyers will still be able to place bids against the page. However, you will need to
            accept them in order to complete the purchase.
          </p>
          <p>You can relist this page at any time.</p>
        </Modal>
        <Modal
          title={
            offer && offer.isForSale
              ? `Purchase "` + pageTitle + `" for ` + offer.price + ` ETH`
              : `Error`
          }
          visible={purchaseFullPriceModalVisible}
          onOk={() => {
            setPurchaseFullPriceModalVisible(false);
            purchaseForFullPrice();
          }}
          onCancel={() => setPurchaseFullPriceModalVisible(false)}
        >
          <p>TODO(bingbongle): Add donation bit</p>
          <p>TODO(bingbongle): Add donation bit</p>
        </Modal>
        {/* TODO(bingbongle) Add bid modal */}
      </div>
    </Dropdown>
  );
}
