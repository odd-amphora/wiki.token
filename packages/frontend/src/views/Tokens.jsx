import React from "react";
import { useContractReader } from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";

export default function Claim({ contracts }) {
  const myTokens = useContractReader(contracts, "Token", "myTokens");

  return (
    <div className="menu-view">
      {myTokens ? (
        myTokens.map((token, idx) => {
          return <div>{BigNumber.from(token).toHexString()}</div>;
        })
      ) : (
        <div>No tokens</div>
      )}
    </div>
  );
}
