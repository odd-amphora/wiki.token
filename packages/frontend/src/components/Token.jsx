import React from "react";
import { Image } from "antd";

import { useContractReader } from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";

import { Alert, Button } from "antd";

export default function Token({ address, contracts, imageUrl, pageId, pageTitle }) {
  function openWikipediaPage() {
    window.open(`https://en.wikipedia.org/?curid=${pageId}`);
  }

  function listToken() {
    // TODO(bingbongle) Implement.
  }

  function unlistToken() {
    // TODO(bingbongle) Implement.
  }

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
        <div className="token-button" hidden={offer === undefined || offer.isForSale}>
          List
        </div>
        <div hidden={offer === undefined || !offer.isForSale}>Unlist</div>
      </div>
      <div>{owner}</div>
    </div>
  );
}
