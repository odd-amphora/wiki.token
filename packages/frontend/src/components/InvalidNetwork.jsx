import React, { useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { Modal } from "antd";
import { getChainId, NETWORK, CHAIN_ID_TO_NETWORK } from "../constants";

const IS_READY_DELAY_MS = 3000;

export default function InvalidNetwork() {
  const { account, chainId } = useEthers();
  const [isReady, setIsReady] = useState(false);
  const [isValidNetwork, setIsValidNetwork] = useState(false);

  const isConnectedToValidNetwork = (account, chainId) => {
    if (!account || !chainId) {
      return true;
    }
    // TODO(odd-amphora): Clean this up.
    if (NETWORK === "localhost" && (chainId === 31337 || chainId === 1337)) {
      return true;
    }
    return getChainId() === chainId;
  };

  useEffect(() => {
    const validNetwork = isConnectedToValidNetwork(account, chainId);
    if (validNetwork !== isValidNetwork) {
      setIsValidNetwork(validNetwork);
    }
  }, [account, chainId, isValidNetwork]);

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, IS_READY_DELAY_MS);
  }, []);

  return (
    <>
      {isReady && (
        <Modal title="Invalid network" visible={!isValidNetwork} footer={null} closable={false}>
          <span>
            Your wallet is connected to{" "}
            <span className="invalid-network">{CHAIN_ID_TO_NETWORK[chainId]}</span>, but you are
            using the <span className="invalid-network">{NETWORK}</span> WikiToken app. Please
            connect to a different network in Metamask, or connect to a different WikiToken
            application.
          </span>
        </Modal>
      )}
    </>
  );
}
