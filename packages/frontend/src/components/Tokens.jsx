import React from "react";

import { Divider } from "antd";

import { Token } from ".";

export default function Tokens({ address, noTokensHeader, signer, tokens, transactor, web3Modal }) {
  return (
    <div className="menu-view">
      {!tokens || tokens.length === 0 && <div>{noTokensHeader}</div>}
      <div hidden={web3Modal && web3Modal.cachedProvider}>
        <Divider />
        Connect a wallet to get started{" "}
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
