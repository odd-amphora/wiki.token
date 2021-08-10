import React, { useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";

import { useWikiTokenContract } from "../hooks";
import { formatAddress } from "../utils/stringUtils";

export default function Token({ imageUrl, pageId, pageTitle, sponsorshipStatus, showOwner }) {
  const wikiTokenContract = useWikiTokenContract(/*readOnly=*/ true);
  const [owner, setOwner] = useState("");
  const { account } = useEthers();

  useEffect(() => {
    wikiTokenContract
      .ownerOf(pageId)
      .then(res => setOwner(res))
      .catch(err => {
        console.log(`Error fetching owner of ${pageId}:`, err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, account, sponsorshipStatus]);

  const openWikipediaPage = () => {
    window.open(`https://en.wikipedia.org/?curid=${pageId}`);
  };

  const openEtherscan = () => {
    window.open(`https://etherscan.io/address/${owner}`);
  };

  return (
    <div className="token">
      <div className="token-wrapper">
        <div className="token-image" onClick={openWikipediaPage}>
          <img className="token-image-src" alt="wiki" width={248} height={248} src={imageUrl} />
        </div>
        <div className="token-text-box">
          <div className="token-page-title" onClick={openWikipediaPage}>{`${pageTitle}`}</div>
          <div className="token-page-id">{pageId}</div>
        </div>
      </div>
      {showOwner && (
        <div className="token-owner">
          <span className="link-span" onClick={openEtherscan}>
            {account && owner === account ? `You own this token` : formatAddress(owner)}
          </span>
        </div>
      )}
    </div>
  );
}
