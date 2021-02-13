import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useGasPrice, useUserProvider, useContractLoader } from "./hooks";
import { Layout } from "./components";
import { INFURA_ID, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import { Claim } from "./views";

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

const targetNetwork = NETWORKS["localhost"];

const localProviderUrl = targetNetwork.rpcUrl;
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER
  ? process.env.REACT_APP_PROVIDER
  : localProviderUrl;
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

function App() {
  const [injectedProvider, setInjectedProvider] = useState();

  const gasPrice = useGasPrice(targetNetwork, "fast");

  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const contracts = useContractLoader(localProvider);
  const transactor = Transactor(userProvider, gasPrice);

  return (
    <div className="App">
      <Layout address={address} onConnectWallet={loadWeb3Modal}>
        <Claim contracts={contracts} signer={userProvider.getSigner()} transactor={transactor} />
      </Layout>
    </div>
  );
}

export default App;
