import React from "react";

import { Divider } from "antd";

import { Token } from "../components";

export default function Tokens({
  address,
  contracts,
  headerText,
  localProvider,
  signer,
  tokens,
  transactor,
  walletNotConnectedText,
  web3Modal,
}) {
  return (
    <div className="menu-view">
      <div>{headerText}</div>
      <div hidden={web3Modal && web3Modal.cachedProvider}>
        <Divider />
        {walletNotConnectedText.concat(" ")}
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
              localProvider={localProvider}
            />
          );
        })}
      </div>
    </div>
  );
}
