import React from "react";

import Header from "./Header";
// import { Alert } from "antd";

export default function Layout({
  address,
  web3Modal,
  onConnectWallet,
  onLogout,
  provider,
  price,
  children,
}) {
  return (
    <>
      {/* <Alert
        message={`Network: ${process.env.REACT_APP_INFURA_NETWORK}`}
        type="warning"
        style={{
          visibility: process.env.REACT_APP_INFURA_NETWORK === "mainnet" ? "gone" : "visible",
        }}
      />
      <Alert message="Wiki Token is still in development, use at your own risk" type="error" /> */}
      <Header
        address={address}
        web3Modal={web3Modal}
        onConnectWallet={onConnectWallet}
        onLogout={onLogout}
        price={price}
        provider={provider}
      />
      {children}
    </>
  );
}
