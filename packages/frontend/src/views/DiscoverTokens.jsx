import React, { useEffect, useState } from "react";

import { Tokens } from "../components";
import { useWikiTokenContract, useTokensProvider } from "../hooks";

const DISCOVER_TOKENS_PAGE_SIZE = 10000;

export default function DiscoverTokens({ address, signer, transactor, web3Modal }) {
  const wikiTokenContract = useWikiTokenContract();

  const [discoverTokensResult, setDiscoverTokensResult] = useState([]);
  const discoverTokens = useTokensProvider(discoverTokensResult);

  useEffect(() => {
    wikiTokenContract
      .discover(0, DISCOVER_TOKENS_PAGE_SIZE, true)
      .then(res => {
        setDiscoverTokensResult(res);
      })
      .catch(err => {
        console.log("Error fetching tokens for address: ", err);
      });
  }, []);

  return (
    <Tokens
      address={address}
      signer={signer}
      transactor={transactor}
      web3Modal={web3Modal}
      tokens={discoverTokens}
      headerText={
        discoverTokens && discoverTokens.length > 0
          ? `Right click on a token to purchase it for full price, or to place a bid 🏦`
          : `No tokens have been claimed... yet 😞`
      }
    />
  );
}
