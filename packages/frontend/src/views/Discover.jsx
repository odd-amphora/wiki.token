import React from "react";

import { Token } from "../components";

export default function Discover({ tokens }) {
  return (
    <div className="menu-view">
      <div hidden={tokens && tokens.length > 0}>No Wiki Tokens have been claimed yet :(</div>
      <div hidden={!tokens || tokens.length == 0}>
        {tokens.map(token => {
          return (
            <Token
              imageUrl={token.properties?.image?.description}
              pageTitle={token.properties?.description?.description}
              pageId={token.properties?.name?.description}
            />
          );
        })}
      </div>
    </div>
  );
}
