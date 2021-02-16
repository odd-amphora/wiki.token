import React from "react";

import { Divider } from "antd";

import { Token } from "../components";

export default function Tokens({ tokens, web3Modal }) {
  return (
    <div className="menu-view">
      <div hidden={tokens && tokens.length > 0}>
        You haven't claimed any tokens yet <span role="img">😔</span>
      </div>
      <div hidden={web3Modal && web3Modal.cachedProvider}>
        <Divider />
        Connect a wallet to claim your first one <span role="img">🚀</span>
      </div>
      <div hidden={!tokens || tokens.length === 0}>
        {tokens.map(token => {
          return (
            <Token
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
