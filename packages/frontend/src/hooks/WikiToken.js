import { useEthers } from "@usedapp/core";
import { Contract, providers } from "ethers";
import { networkConfig } from "..";
import { WIKI_TOKEN_ADDRESS, WIKI_TOKEN_ABI } from "../constants";

export default function useWikiTokenContract(readOnly = false) {
  const { library } = useEthers();

  const readNetworkUrl =
    networkConfig.readOnlyChainId &&
    networkConfig.readOnlyUrls &&
    networkConfig.readOnlyUrls[networkConfig.readOnlyChainId];

  if (readOnly) {
    return new Contract(
      WIKI_TOKEN_ADDRESS,
      WIKI_TOKEN_ABI,
      new providers.JsonRpcProvider(readNetworkUrl),
    );
  }

  return new Contract(
    WIKI_TOKEN_ADDRESS,
    WIKI_TOKEN_ABI,
    library?.getSigner() ?? new providers.JsonRpcProvider(readNetworkUrl),
  );
}
