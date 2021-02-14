import React from "react";
import { PageHeader, Tag } from "antd";

import Account from "./Account";

export default function Header({ address, onConnectWallet, price, provider }) {
  return (
    <PageHeader
      ghost={false}
      title="wiki.token"
      extra={[
        <Account
          address={address}
          onConnectWallet={onConnectWallet}
          price={price}
          provider={provider}
        />,
      ]}
    />
  );
}
