import React from "react";
import { Button } from "antd";
import Balance from "./Balance";

import { FormatAddress } from "../helpers";

export default function Account({
  address,
  web3Modal,
  onConnectWallet,
  onLogout,
  price,
  provider,
}) {
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
        {web3Modal && web3Modal.cachedProvider && address ? FormatAddress(address) : "Connect"}
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
