import React from "react";
import { Button } from "antd";
import Balance from "./Balance";

export default function Account({
  address,
  web3Modal,
  onConnectWallet,
  onLogout,
  price,
  provider,
}) {
  function formatAddress(address) {
    // TODO(teddywilson) validate addresses properly?
    if (address < 12) {
      return address;
    }
    const beginning = address.substring(0, 6);
    const end = address.substring(address.length - 6);
    return beginning.concat(`...`).concat(end);
  }

  return (
    <div className="account">
      <Balance address={address} provider={provider} price={price} />
      <Button
        type="primary"
        shape="round"
        ghost={true}
        onClick={onConnectWallet}
        className="connect-button"
      >
        {web3Modal && web3Modal.cachedProvider && address ? formatAddress(address) : "Connect"}
      </Button>
      <Button
        ghost={true}
        danger
        hidden={!web3Modal || !web3Modal.cachedProvider}
        onClick={onLogout}
      >
        Logout
      </Button>
    </div>
  );
}
