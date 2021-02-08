import React from "react";
import { Button } from "antd";

export default function Account({ onConnectWallet }) {
  return (
    <Button type="primary" shape="round" ghost={true} onClick={onConnectWallet}>
      Connect
    </Button>
  );
}
