import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader } from "./hooks";
import { Landing } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS["localhost"]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/frontend/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER
  ? process.env.REACT_APP_PROVIDER
  : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);
  if (DEBUG) console.log("👩‍💼 selected address:", address);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  // -- everything above this line (and outside of this class) is provided by scaffolding
  // -- and needs to be parsed through. most likely not needed for wiki-coin.

  const contracts = useContractLoader(localProvider);

  return (
    <div className="App">
      <Landing contracts={contracts} />
    </div>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
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

window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });

export default App;
