import React from "react";
import { PageHeader, Button } from "antd";

import Account from "./Account";

export default function Header({ onConnectWallet }) {
  return (
    <PageHeader
      ghost={false}
      title="wiki.token"
      extra={[<Account onConnectWallet={onConnectWallet} />]}
    />
  );
}
