import { ChainId } from "@usedapp/core";

const WIKI_TOKEN_ABIS = {
  localhost: require("./contracts/localhost/Token.abi"),
  kovan: require("./contracts/kovan/Token.abi"),
  rinkeby: require("./contracts/rinkeby/Token.abi"),
  mainnet: require("./contracts/mainnet/Token.abi"),
};

const WIKI_TOKEN_ADDRESSES = {
  localhost: require("./contracts/localhost/Token.address"),
  kovan: require("./contracts/kovan/Token.address"),
  rinkeby: require("./contracts/rinkeby/Token.address"),
  mainnet: "0xD224B0eAf5B5799ca46D9FdB89a2C10941E66109",
};

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const MINT_FEE = "0.01 ETH";

// TODO: should be lowercase.
export const NETWORK = process.env.REACT_APP_INFURA_NETWORK || "localhost";

export const MAINNET = "mainnet";
export const RINKEBY = "rinkeby";
export const KOVAN = "kovan";
export const LOCALHOST = "localhost";

const localhostChainId = 31337;
const rinkebyChainId = ChainId.Rinkeby;
const kovanChainId = ChainId.Kovan;
const mainnetChainId = ChainId.Mainnet;

export const NETWORK_TO_CHAIN_ID = {
  localhost: localhostChainId,
  rinkeby: rinkebyChainId,
  kovan: kovanChainId,
  mainnet: mainnetChainId,
};

export const CHAIN_ID_TO_NETWORK = {
  31337: LOCALHOST,
  1337: LOCALHOST,
  4: RINKEBY,
  42: KOVAN,
  1: MAINNET,
};

export const getChainId = () => {
  return NETWORK_TO_CHAIN_ID[NETWORK];
};

export const WIKI_TOKEN_ABI = WIKI_TOKEN_ABIS[NETWORK];
export const WIKI_TOKEN_ADDRESS = WIKI_TOKEN_ADDRESSES[NETWORK];
