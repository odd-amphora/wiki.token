import React from "react";
import { PageHeader } from "antd";

import Account from "./Account";

export default function Header({ address, web3Modal, onConnectWallet, onLogout, price, provider }) {
  return (
    <PageHeader
      ghost={false}
      title="wiki.token"
      extra={[
        <Account
          key="0"
          address={address}
          web3Modal={web3Modal}
          onLogout={onLogout}
          onConnectWallet={onConnectWallet}
          price={price}
          provider={provider}
        />,
      ]}
    />
  );
}
