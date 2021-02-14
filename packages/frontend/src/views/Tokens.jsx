import React, { useEffect, useState } from "react";

import axios from "axios";

import { Token } from "../components";
import { useContractReader } from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";

export default function Tokens({ tokens }) {
  return (
    <div className="menu-view">
      <div hidden={tokens.length > 0}>You haven't claimed any tokens yet :(</div>
      <div hidden={tokens.length == 0}>
        {tokens.map(token => {
          return <Token imageUrl={token.properties?.image?.description} />;
        })}
      </div>
    </div>
  );
}
