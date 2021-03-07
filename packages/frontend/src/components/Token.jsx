import React, { useState } from "react";
import { Image } from "antd";

import { useContractReader } from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";

import { Alert, Button, Modal } from "antd";

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

  return (
    <div className="token">
      <Alert
        message={offer && offer.isForSale === true ? "💸  For sale" : "🤷  Not listed"}
        type={offer && offer.isForSale === true ? "success" : "warning"}
      />
      <div className="token-wrapper">
        <Image
          width={196}
          src={imageUrl}
          preview={false}
          onClick={() => {
            openWikipediaPage();
          }}
        />
        <div className="token-text-box">
          <div className="token-page-title">{`"${pageTitle}"`}</div>
          <div className="token-page-id">{pageId}</div>
        </div>
      </div>
      {/* Not owner actions */}
      <div className="token-button" hidden={owner === address}>
        Place bid
      </div>
      {/* Owner actions */}
      <div hidden={offer === undefined || owner !== address}>
        <div
          className="token-button"
          hidden={offer === undefined || offer.isForSale}
          onClick={() => {
            setListTokenModalVisible(true);
          }}
        >
          List
        </div>
        <div
          className="token-button"
          hidden={offer === undefined || !offer.isForSale}
          onClick={() => {
            setUnlistTokenModalVisible(true);
          }}
        >
          Unlist
        </div>
      </div>
      <div>{owner}</div>
      {/* TODO(bingbongle) Add price form */}
      <Modal
        title={`List "` + pageTitle + `" for sale`}
        visible={listTokenModalVisible}
        onOk={() => {
          setListTokenModalVisible(false);
          listToken();
        }}
        onCancel={() => setListTokenModalVisible(false)}
      ></Modal>
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
  );
}
