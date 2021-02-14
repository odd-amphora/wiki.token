import { useState, useEffect } from "react";
import { useContractReader } from ".";

import axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";

function useTokensProvider(contracts, address) {
  const [tokens, setTokens] = useState([{}]);
  const myTokens = useContractReader(contracts, "Token", "tokens", [address]);

  useEffect(() => {
    myTokens &&
      Promise.all(
        myTokens.map(token => {
          return axios
            .get(
              `${process.env.REACT_APP_METADATA_API_BASE_URL}/token?id=${BigNumber.from(
                token,
              ).toNumber(token)}`,
            )
            .then(res => res.data);
        }),
      ).then(tokens => {
        setTokens(tokens);
      });
  }, [myTokens]);

  return tokens;
}

export default useTokensProvider;
