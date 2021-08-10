const WIKI_TOKEN_ABIS = {
  localhost: require("./contracts/localhost/Token.abi"),
  kovan: require("./contracts/kovan/Token.abi"),
  rinkeby: require("./contracts/rinkeby/Token.abi"),
  // mainnet: require("./contracts/mainnet/Token.abi"),
};

const WIKI_TOKEN_ADDRESSES = {
  localhost: require("./contracts/localhost/Token.address"),
  kovan: require("./contracts/kovan/Token.address"),
  rinkeby: require("./contracts/rinkeby/Token.address"),
  // mainnet: require("./contracts/mainnet/Token.abi"),
};

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const MINT_FEE = "0.01 ETH";

export const NETWORK = process.env.REACT_APP_INFURA_NETWORK || "localhost";

export const MAINNET = "mainnet";

export const WIKI_TOKEN_ABI = WIKI_TOKEN_ABIS[NETWORK];
export const WIKI_TOKEN_ADDRESS = WIKI_TOKEN_ADDRESSES[NETWORK];
