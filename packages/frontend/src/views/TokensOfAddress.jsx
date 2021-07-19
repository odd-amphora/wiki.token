import React, { useEffect, useState } from "react";

import { Tokens } from "../components";
import { useTokensProvider, useWikiTokenContract } from "../hooks";

const TOKENS_OF_ADDRESS_PAGE_SIZE = 10000;

export default function TokensOfAddress({ address, signer, transactor, web3Modal }) {
  const wikiTokenContract = useWikiTokenContract();

  const [tokensOfResult, setTokensOfResult] = useState([]);
  const tokens = useTokensProvider(tokensOfResult);

  useEffect(() => {
    wikiTokenContract
      .tokensOf(address, 0, TOKENS_OF_ADDRESS_PAGE_SIZE, true)
      .then(res => setTokensOfResult(res))
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
      tokens={tokens}
      headerText={
        tokens && tokens.length > 0
          ? `Right click on a token to accept a bid, or to list it for sale 📈`
          : `You haven't claimed any tokens... yet 😞`
      }
    />
  );
}
