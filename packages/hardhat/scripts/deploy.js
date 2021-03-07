/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");

const DEFAULT_DONATION_PERCENTAGE = 1;

const main = async () => {
  console.log("\n\n 📡 Deploying...\n");

  if (!process.env.WIKI_TOKEN_BASE_URI) {
    throw "❌ WIKI_TOKEN_BASE_URI is not set";
  }

  // Page ID will be directly concatenated to URI to save memory
  // so is vital that the URI ends with a slash.
  if (
    !process.env.WIKI_TOKEN_BASE_URI.startsWith("http") ||
    !process.env.WIKI_TOKEN_BASE_URI.endsWith("/")
  ) {
    throw "❌ Invalid WIKI_TOKEN_BASE_URI";
  }

  const token = await deploy("Token", [
    process.env.WIKI_TOKEN_BASE_URI,
    DEFAULT_DONATION_PERCENTAGE,
  ]);

  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/hardhat/artifacts/"),
    "\n\n",
  );
};

const deploy = async (contractName, _args = [], overrides = {}, libraries = {}) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName, {
    libraries: libraries,
  });
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

  console.log(" 📄", chalk.cyan(contractName), "deployed to:", chalk.magenta(deployed.address));

  if (!encoded || encoded.length <= 2) return deployed;
  fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

  return deployed;
};

// ------ utils -------

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs) => {
  // not writing abi encoded args if this does not pass
  if (!contractArgs || !deployed || !R.hasPath(["interface", "deploy"], deployed)) {
    return "";
  }
  const encoded = utils.defaultAbiCoder.encode(deployed.interface.deploy.inputs, contractArgs);
  return encoded;
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
