import React, { useEffect, useState } from "react";

import { Tokens } from "../components";
import { useTokensProvider, useWikiTokenContract } from "../hooks";

const TOKENS_OF_ADDRESS_PAGE_SIZE = 10000;

export default function TokensOfAddress({ address, signer, transactor, web3Modal }) {
  const wikiTokenContract = useWikiTokenContract();

  const [tokensOfResult, setTokensOfResult] = useState([]);
  const tokens = useTokensProvider(tokensOfResult);

  useEffect(() => {
    console.log("hello?: ", address);
    wikiTokenContract
      .tokensOfOwner(address)
      .then(res => {
        console.log("TokensOfAddress result: ", res);
        setTokensOfResult(res)
      })
      .catch(err => {
        console.log("Error fetching tokens for address: ", err);
      });
  }, [address]);

  return (
    <Tokens
      address={address}
      signer={signer}
      transactor={transactor}
      web3Modal={web3Modal}
      tokens={tokens}
      noTokensHeader={`You haven't claimed any tokens... yet 😞`}
    />
  );
}
