import React from "react";

import { Token } from "../components";

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
