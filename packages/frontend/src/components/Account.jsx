import React from "react";
import { Button } from "antd";
import { useEthers } from "@usedapp/core";

export default function Account() {
  const { activateBrowserWallet, account, deactivate } = useEthers();

  return (
    <div className="account">
      {!account ? (
        <Button
          type="primary"
          shape="round"
          ghost={true}
          onClick={() => activateBrowserWallet()}
          className="connect-button"
        >
          Connect
        </Button>
      ) : (
        <div>
          <div className="account-address">{account}</div>
          <Button ghost={true} danger onClick={() => deactivate()}>
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
