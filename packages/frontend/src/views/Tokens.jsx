import React from "react";

import { Divider } from "antd";

import { Token } from "../components";

export default function Tokens({
  price,
  address,
  tokens,
  web3Modal,
  contracts,
  transactor,
  signer,
  emptyStateHeader,
  emptyStateSubtitle,
}) {
  return (
    <div className="menu-view">
      <div hidden={tokens && tokens.length > 0}>
        {emptyStateHeader.concat(" ")}
        <span role="img" aria-label="sad-face">
          😔
        </span>
      </div>
      <div hidden={web3Modal && web3Modal.cachedProvider}>
        <Divider />
        {emptyStateSubtitle.concat(" ")}
        <span role="img" aria-label="rocket">
          🚀
        </span>
      </div>
      <div hidden={!tokens || tokens.length === 0}>
        {tokens.map(token => {
          return (
            <Token
              transactor={transactor}
              signer={signer}
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
