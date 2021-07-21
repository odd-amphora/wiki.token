import React, { useEffect, useState } from "react";

import { Image } from "antd";

import { FormatAddress } from "../helpers";
import { useWikiTokenContract } from "../hooks";
import { NULL_ADDRESS } from "../constants";

import web3 from "web3";

export default function Token({ address, imageUrl, pageId, pageTitle}) {
  const wikiTokenContract = useWikiTokenContract();

  // Poll the owner of this token.
  const [owner, setOwner] = useState('');

  useEffect(() => {
    wikiTokenContract.ownerOf(pageId).then(res => setOwner(res)).catch(err => {
      console.log('Error: ', err);
    });
  }, [pageId]);

  /**
   * Opens the tokens corresponding Wikipedia. Inteded to be triggered when the
   * image is (left) clicked.
   */
  const openWikipediaPage = () => {
    window.open(`https://en.wikipedia.org/?curid=${pageId}`);
  };

  return (
      <div className="token">
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
      </div>
  );
}
