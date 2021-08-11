import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.scss";
import App from "./App";
import { Footer, InvalidNetwork } from "./components";
import { ChainId, DAppProvider } from "@usedapp/core";
import { NETWORK, NETWORK_TO_CHAIN_ID } from "./constants";
import Countdown from "react-countdown";

export const networkConfig = {
  readOnlyChainId: NETWORK_TO_CHAIN_ID[NETWORK],
  readOnlyUrls: {
    31337: `http://localhost:8545`,
    [ChainId.Localhost]: `http://localhost:8545`,
    [ChainId.Kovan]: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
    [ChainId.Rinkeby]: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
    [ChainId.Mainnet]: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  },
  multicallAddresses: {
    31337: `http://localhost:8545`,
    [ChainId.Localhost]: `http://localhost:8545`,
    [ChainId.Kovan]: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
    [ChainId.Rinkeby]: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
    [ChainId.Mainnet]: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  },
  supportedChains: [31337, ChainId.Localhost, ChainId.Kovan, ChainId.Rinkeby, ChainId.Mainnet],
};

const renderer = ({ hours, minutes, seconds, completed }) => {
  if (!completed) {
    return (
      <span className="countdown">
        {hours}:{minutes}:{seconds}
      </span>
    );
  }
};

ReactDOM.render(
  <BrowserRouter>
    {NETWORK === "mainnet" ? (
      <Countdown date={"12 Aug 2021 00:08:00 GMT-0400"} renderer={renderer} />
    ) : (
      <DAppProvider config={networkConfig}>
        <InvalidNetwork />
        <App key="1" />
        <Footer key="2" />
      </DAppProvider>
    )}
  </BrowserRouter>,
  document.getElementById("root"),
);
