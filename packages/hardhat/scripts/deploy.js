/* eslint no-use-before-define: "warn" */
const dotenv = require("dotenv");
const chalk = require("chalk");
const fs = require("fs");
const publish = require("./publish");

const R = require("ramda");

const { ethers } = require("hardhat");
const { utils } = require("ethers");

dotenv.config();

const NETWORK_LOCALHOST = "localhost";
const NETWORK_KOVAN = "kovan";
const NETWORK_RINKEBY = "rinkeby";
const NETWORK_MAINNET = "mainnet";

const wikiTokenBaseURI = process.env.WIKI_TOKEN_BASE_URI || "http://localhost:5000/api/token/";
const network = process.env.HARDHAT_NETWORK || "localhost";
const artifactsDir = `artifacts`;

const multisigAddress = "0x549238D4eE184e2Cb4d3B7DCf47Be933d1348Fa8"; // wikitoken.eth

const getJuiceProjectId = () => {
  if (network === NETWORK_LOCALHOST) {
    return "0x01"; // Juice is disabled in local dev anyway.
  }
  // Juicebox project https://kovan.juicebox.money/#/p/wikitokenDAO
  if (network === NETWORK_KOVAN) {
    return "0x01";
  }
  if (network === NETWORK_RINKEBY) {
    return "0x02";
  }
  throw error(`Network ${network} does not have a Juice project configured`);
};

const getJuiceTerminalDirectory = () => {
  if (network === NETWORK_LOCALHOST) {
    return "0x0000000000000000000000000000000000000000"; // Juice is disabled in local dev anyway.
  }
  if (network === NETWORK_KOVAN) {
    return "0x71BA69044CbD951AC87124cBEdbC0334AB21F26D";
  }
  if (network === NETWORK_RINKEBY) {
    return "0x5d03dA1Ec58cf319c4fDbf2E3fE3DDcd887ef9aD";
  }
  throw error(`Network ${network} does not have a Juice terminal directory configured`);
};

// ABI encodes contract arguments.
// This is useful when you want to manually verify the contracts, for example, on Etherscan.
const abiEncodeArgs = (deployed, contractArgs) => {
  // Don't write ABI encoded args if this does not pass.
  if (!contractArgs || !deployed || !R.hasPath(["interface", "deploy"], deployed)) {
    return "";
  }
  const encoded = utils.defaultAbiCoder.encode(deployed.interface.deploy.inputs, contractArgs);
  return encoded;
};

const deploy = async (contractName, _args = [], overrides = {}, libraries = {}) => {
  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName, {
    libraries: libraries,
  });
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`${artifactsDir}/${contractName}.address`, deployed.address);

  console.log("📄", chalk.cyan(contractName), "deployed to:", chalk.magenta(deployed.address));

  if (!encoded || encoded.length <= 2) return deployed;
  fs.writeFileSync(`${artifactsDir}/${contractName}.args`, encoded.slice(2));

  return deployed;
};

const main = async () => {
  if (!wikiTokenBaseURI) {
    throw "❌ WIKI_TOKEN_BASE_URI is not set";
  }

  // Page ID will be directly concatenated to URI to save memory
  // so is vital that the URI ends with a slash.
  if (!wikiTokenBaseURI.startsWith("http") || !wikiTokenBaseURI.endsWith("/api/token/")) {
    throw "❌ Invalid WIKI_TOKEN_BASE_URI";
  }

  if (!process.env.INFURA_ID) {
    throw "❌ INFURA_ID is not set";
  }

  const isJuiceEnabled = network !== NETWORK_LOCALHOST;
  const juiceProjectId = getJuiceProjectId();
  const juiceTerminalDirectory = getJuiceTerminalDirectory();

  console.log(
    `🛰  Deploying WikiToken with the following parameters:\n`,
    chalk.green(` - wikiTokenBaseURI`),
    `=`,
    chalk.cyan(wikiTokenBaseURI),
    `\n`,
    chalk.green(` - isJuiceEnabled`),
    `=`,
    chalk.cyan(isJuiceEnabled),
    `\n`,
    chalk.green(` - juiceProjectId`),
    `=`,
    chalk.cyan(juiceProjectId),
    `\n`,
    chalk.green(` - juiceTerminalDirectory`),
    `=`,
    chalk.magenta(juiceTerminalDirectory),
  );

  console.log("\n");

  const token = await deploy("Token", [
    wikiTokenBaseURI,
    isJuiceEnabled,
    juiceProjectId,
    juiceTerminalDirectory,
  ]);

  console.log(`🤝 Transferring ownership to:`, chalk.magenta(multisigAddress));

  await token.transferOwnership(multisigAddress);

  console.log("\n");

  console.log(
    "⚡️ All contract artifacts saved to:",
    chalk.yellow(`packages/hardhat/${artifactsDir}/`),
    "\n",
  );

  console.log(chalk.green("✔ Deployed for network:"), network, "\n");

  await publish(network);
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
