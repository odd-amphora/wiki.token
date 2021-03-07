import React from "react";

import { Token } from "../components";

// TODO(teddywilson) perhaps abstract this view with MyTokens but it probably will need its
// own sp
export default function Discover({ address, tokens, contracts }) {
  return (
    <div className="menu-view">
      <div hidden={tokens && tokens.length > 0}>
        No Wiki Tokens have been claimed yet{" "}
        <span role="img" aria-label="sad-face">
          😔
        </span>
      </div>
      <div hidden={!tokens || tokens.length === 0}>
        {tokens.map(token => {
          return (
            <Token
              address={address}
              contracts={contracts}
              key={token.properties?.name?.description}
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
