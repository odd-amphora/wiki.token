import React, { useState } from "react";
import { Image } from "antd";

import { FormatAddress } from "../helpers";
import { useContractReader } from "../hooks";

import { BigNumber } from "@ethersproject/bignumber";

import { Alert, InputNumber, Modal, Menu, Popover, Dropdown } from "antd";

export default function Token({
  address,
  contracts,
  imageUrl,
  pageId,
  pageTitle,
  transactor,
  signer,
}) {
  function openWikipediaPage() {
    window.open(`https://en.wikipedia.org/?curid=${pageId}`);
  }

  const listToken = async () => {
    // TODO(bingbongle) validation, loading spinner, etc.
    // TODO(bingbongle) list amount should be input by user.
    await transactor(
      contracts["Token"].connect(signer)["offerPageForSale"](pageId, BigNumber.from(2)),
    );
  };

  const unlistToken = async () => {
    // TODO(bingbongle) validation, loading spinner, etc.
    await transactor(contracts["Token"].connect(signer)["pageNoLongerForSale"](pageId));
  };

  function placeBid() {
    // TODO(bingbongle) Implement.
  }

  // Poll offer corresponding to the page ID.
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
            seller: newOffer[2],
          }
        : null;
    },
  );

  // Poll the owner of the page ID.
  const owner = useContractReader(contracts, "Token", "pageIdToAddress", [pageId]);

  const [listTokenModalVisible, setListTokenModalVisible] = useState(false);
  const [unlistTokenModalVisible, setUnlistTokenModalVisible] = useState(false);
  const [acceptBidModalVisible, setAcceptBidModalVisible] = useState(false);
  const [viewTxHistoryModalVisible, setViewTxHistoryModalVisible] = useState(false);

  function handleMenuClick(e) {
    switch (e.key) {
      case "1":
        setListTokenModalVisible(true);
        break;
      case "2":
        setUnlistTokenModalVisible(true);
        break;
      default:
        console.log(`Event not handled!`, e);
    }
  }

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">🎉 List for sale</Menu.Item>
      <Menu.Item key="2">🛌 Unlist from marketplace</Menu.Item>
      <Menu.Item key="3">👀 View/accept bids</Menu.Item>
      <Menu.Item key="4">🌐 View tx history</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["contextMenu"]}>
      <div className="token">
        <Alert
          message={offer && offer.isForSale === true ? "💸  For sale" : "🤷  Not listed"}
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
        <div className="token-owner">{FormatAddress(owner)}</div>
        {/* TODO(bingbongle) Add price form */}
        <Modal
          title={`List "` + pageTitle + `" for sale`}
          visible={listTokenModalVisible}
          onOk={() => {
            setListTokenModalVisible(false);
            listToken();
          }}
          onCancel={() => setListTokenModalVisible(false)}
        >
          <InputNumber
            style={{
              width: 200,
            }}
            size="large"
            defaultValue="1"
            formatter={value => `$ ${value}`.replace(/[^0-9.]/g, "")}
            min="0"
            step="0.0000001"
            stringMode
          />{" "}
          ETH
          {/* TODO add conversion */}
          <div>~ $10,000 USD</div>
        </Modal>
        <Modal
          title={`Unlist "` + pageTitle + `" from marketplace`}
          visible={unlistTokenModalVisible}
          onOk={() => {
            setUnlistTokenModalVisible(false);
            unlistToken();
          }}
          onCancel={() => setUnlistTokenModalVisible(false)}
        ></Modal>
        {/* TODO(bingbongle) Add bid modal */}
      </div>
    </Dropdown>
  );
}
