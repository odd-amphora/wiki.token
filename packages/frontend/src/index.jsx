import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.scss";
import App from "./App";
import { Footer } from "./components";
import { InvalidNetwork } from "./components/modal";
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

const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (!completed) {
    return (
      <>
        <span className="countdown-header">Come back in</span>
        <span className="countdown-clock">
          {days} day(s), {hours} hour(s), {minutes} minute(s), {seconds} second(s)
        </span>
      </>
    );
  }
};

ReactDOM.render(
  <BrowserRouter>
    {NETWORK === "mainnet" ? (
      <Countdown
        date={new Date("Thursday, August 12, 2021 8:00:00 AM GMT-04:00")}
        renderer={renderer}
      />
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
