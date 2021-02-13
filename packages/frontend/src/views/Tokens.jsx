import React, { useEffect, useState } from "react";

import axios from "axios";

import { Token } from "../components";
import { useContractReader } from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";

export default function Tokens({ contracts }) {
  const [tokenData, setTokenData] = useState();
  const myTokens = useContractReader(contracts, "Token", "myTokens");

  const fetchTokenData = async id => {
    const response = await axios.get(
      `${process.env.REACT_APP_METADATA_API_BASE_URL}/token?id=${id}`,
    );
    console.log(response);
    if (response.status === 200) {
      setTokenData(response.data);
    } else {
      setTokenData(null);
    }
  };

  useEffect(() => {
    if (myTokens) {
      // TODO(teddywilson) obviously this needs to support all tokens
      let firstToken = BigNumber.from(myTokens[0]).toNumber();
      fetchTokenData(firstToken);
    }
  }, [myTokens]);

  return (
    <div className="menu-view">
      {tokenData ? (
        <Token imageUrl={tokenData.properties?.image?.description} />
      ) : (
        <div>No token data</div>
      )}
    </div>
  );
}
