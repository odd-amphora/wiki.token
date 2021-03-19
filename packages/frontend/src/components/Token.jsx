import React, { useState } from "react";

import { Alert, Image, Menu, Dropdown } from "antd";

import { ListTokenModal, /*PlaceBidModal,*/ PurchaseTokenModal, UnlistTokenModal } from "./modals";
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
  // const [placeBidModalVisible, setPlaceBidModalVisible] = useState(false);

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
      return {
        isForSale: newOffer[0],
        price: web3.utils.fromWei(newOffer.minValue.toString(), "ether"),
        seller: newOffer[2],
      };
    },
  );

  // Poll bid belonging to this token.
  // const bid = useContractReader(contracts, "Token", "pageBids", [pageId], 10000, newBid => {
  //   return {
  //     bidder: newBid.bidder,
  //     hasBid: newBid.hasBid,
  //     value: web3.utils.fromWei(newBid.value.toString(), "ether"),
  //   };
  // });

  // Poll donation amount required for this token
  const donationAmount = useContractReader(contracts, "Token", "calculateDonationFromValue", [
    web3.utils.toWei(offer && offer.price ? offer.price.toString() : "0", "ether"),
  ]);

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
        items.push(
          <Menu.Item key={KEY_LIST_FOR_SALE}>
            <span role="img" aria-label="party">
              🎉
            </span>{" "}
            List for sale
          </Menu.Item>,
        );
      }
      // Take page off market
      if (offer.isForSale) {
        items.push(
          <Menu.Item key={KEY_UNLIST_FROM_MARKETPLACE}>
            <span role="img" aria-label="bed">
              🛌{" "}
            </span>{" "}
            Unlist from marketplace
          </Menu.Item>,
        );
      }
    } else {
      // Purchase page for full price
      if (offer.isForSale) {
        items.push(
          <Menu.Item key={KEY_PURCHASE_FULL_PRICE}>
            <span role="img" aria-label="fire">
              🔥
            </span>{" "}
            Purchase for full price
          </Menu.Item>,
        );
      }
      // Place bid on item
      if (offer.isForSale) {
        items.push(
          <Menu.Item key={KEY_PLACE_BID}>
            <span role="img" aria-label="cowboy">
              🤠
            </span>{" "}
            Bid on page
          </Menu.Item>,
        );
      }
    }
    // View bids
    items.push(
      <Menu.Item key={KEY_VIEW_BIDS}>
        <span role="img" aria-label="scale">
          ⚖️
        </span>{" "}
        View outstanding bids
      </Menu.Item>,
    );
    // View page history
    items.push(
      <Menu.Item key={KEY_VIEW_TX_HISTORY}>
        <span role="img" aria-label="globe">
          🌐
        </span>{" "}
        View history
      </Menu.Item>,
    );
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
  // const placeBid = async () => {
  //   // TODO(bingbongle) Implement.
  // };

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
        //setPlaceBidModalVisible(true);
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
            {/* <PlaceBidModal
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
            /> */}
          </div>
        )}
      </div>
    </Dropdown>
  );
}
