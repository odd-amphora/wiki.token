import { useEthers } from "@usedapp/core";
import { Contract, providers } from "ethers";
import { networkConfig } from "..";

import wikiTokenAbi from "../contracts/Token.abi";
import wikiTokenAddress from "../contracts/Token.address";

export default function useWikiTokenContract() {
  const { library } = useEthers();

  const readNetworkUrl =
    networkConfig.readOnlyChainId &&
    networkConfig.readOnlyUrls &&
    networkConfig.readOnlyUrls[networkConfig.readOnlyChainId];

  return new Contract(
    wikiTokenAddress,
    wikiTokenAbi,
    library?.getSigner() ?? new providers.JsonRpcProvider(readNetworkUrl),
  );
}
