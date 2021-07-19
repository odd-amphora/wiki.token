import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.scss";
import App from "./App";
import { Footer } from "./components";

import { ChainId, Config, DAppProvider } from "@usedapp/core";

const infuraId = "9b6950881ce24f88a564ce04f1c18f01";

export const networkConfig = {
  readOnlyChainId: parseInt(process.env.REACT_APP_READONLY_CHAIN_ID || "31337"),
  readOnlyUrls: {
    31337: "http://localhost:8545",
    [ChainId.Localhost]: "http://localhost:8545",
    [ChainId.Mainnet]: "https://mainnet.infura.io/v3/" + infuraId,
  },
  multicallAddresses: {
    31337: "http://localhost:8545",
    [ChainId.Localhost]: "http://localhost:8545",
    [ChainId.Mainnet]: "https://mainnet.infura.io/v3/" + infuraId,
  },
  supportedChains: [31337, ChainId.Localhost, ChainId.Mainnet],
};

ReactDOM.render([<App key="1" />, <Footer key="2" />], document.getElementById("root"));
