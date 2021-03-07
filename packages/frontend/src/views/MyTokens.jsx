import React from "react";

import { Divider } from "antd";

import { Token } from "../components";

export default function Tokens({ address, tokens, web3Modal, contracts }) {
  return (
    <div className="menu-view">
      <div hidden={tokens && tokens.length > 0}>
        You haven't claimed any tokens yet{" "}
        <span role="img" aria-label="sad-face">
          😔
        </span>
      </div>
      <div hidden={web3Modal && web3Modal.cachedProvider}>
        <Divider />
        Connect a wallet to claim your first one{" "}
        <span role="img" aria-label="rocket">
          🚀
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
