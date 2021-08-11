import React, { useState } from "react";
import { Button } from "antd";
import { useEthers } from "@usedapp/core";

import ConnectError from "./modal/ConnectError";

export default function Account() {
  const { activateBrowserWallet, account, deactivate } = useEthers();
  const [connectErrorModalVisible, setConnectErrorModalVisible] = useState(false);

  return (
    <div className="account">
      <ConnectError
        isVisible={connectErrorModalVisible}
        onClose={() => {
          setConnectErrorModalVisible(false);
        }}
      />
      {!account ? (
        <Button
          type="primary"
          shape="round"
          ghost={true}
          onClick={() =>
            activateBrowserWallet(e => {
              console.log("error: ", e);
              setConnectErrorModalVisible(true);
            })
          }
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
