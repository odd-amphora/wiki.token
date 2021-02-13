import React, { useEffect, useState } from "react";

import axios from "axios";

import { Token } from "../components";
import { useContractReader } from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";

export default function Tokens({ address, contracts }) {
  const [tokens, setTokens] = useState([{}]);
  const myTokens = useContractReader(contracts, "Token", "tokens", [address]);

  useEffect(() => {
    myTokens &&
      Promise.all(
        myTokens.map(token => {
          return axios
            .get(
              `${process.env.REACT_APP_METADATA_API_BASE_URL}/token?id=${BigNumber.from(
                token,
              ).toNumber(token)}`,
            )
            .then(res => res.data);
        }),
      ).then(tokens => {
        setTokens(tokens);
      });
  }, [myTokens]);

  return (
    <div className="menu-view">
      {tokens.map(token => {
        return <Token imageUrl={token.properties?.image?.description} />;
      })}
    </div>
  );
}
