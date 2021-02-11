import React from "react";
import { Button } from "antd";

export default function Account({ address, onConnectWallet }) {
  // TODO(teddywilson) validate addresses?
  function formatAddress(address) {
    const beginning = address.substring(0, 6);
    const end = address.substring(address.length - 6);
    return beginning.concat(`...`).concat(end);
  }

  return (
    <Button type="primary" shape="round" ghost={true} onClick={onConnectWallet}>
      {address ? formatAddress(address) : "Connect"}
    </Button>
  );
}
