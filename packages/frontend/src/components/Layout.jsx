import React from "react";

import Header from "./Header";
import { Alert } from "antd";

export default function Layout({ address, onConnectWallet, provider, price, children }) {
  return (
    <>
      <Alert message="Wiki Token is still in development, use at your own risk" type="error" />
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
