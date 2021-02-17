import { useState, useEffect } from "react";

import axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";

function useTokensProvider(tokensResultJson) {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    if (!tokensResultJson) {
      return;
    }
    let tokensResultArr = JSON.parse(tokensResultJson);
    Promise.all(
      tokensResultArr.map(token => {
        return axios
          .get(
            `${process.env.REACT_APP_METADATA_API_BASE_URL}/api/token/${BigNumber.from(
              token,
            ).toNumber(token)}`,
          )
          .then(res => res.data);
      }),
    ).then(tokens => {
      setTokens(tokens);
    });
  }, [tokensResultJson]);

  return tokens;
}

export default useTokensProvider;
