import { useState, useEffect } from "react";

import axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";

function useTokensProvider(tokensResult) {
  const [tokens, setTokens] = useState();

  useEffect(() => {
    tokensResult && Promise.all(
      tokensResult.map(token => {
        return axios
          .get(
            `${process.env.REACT_APP_METADATA_API_BASE_URL}/api/token/${BigNumber.from(
              token,
            ).toNumber(token)}`,
          )
          .then(res => res.data)
          .catch(err => {
            return null;
          });
      }),
    ).then(tokens => {
      setTokens(tokens);
    });
  }, [tokensResult]);

  return tokens;
}

export default useTokensProvider;
