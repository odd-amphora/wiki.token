import React from "react";

import Header from "./Header";

export default function Layout({ address, onConnectWallet, provider, price, children }) {
  return (
    <>
      <Header
        address={address}
        onConnectWallet={onConnectWallet}
        price={price}
        provider={provider}
      />
      {children}
    </>
  );
}
