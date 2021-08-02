import React, { useEffect, useState } from "react";

import { Divider, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTokensProvider, useWikiTokenContract } from "../hooks";
import { useEthers } from "@usedapp/core";

import { Token } from ".";

const spinIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const PAGE_SIZE = 10;

export default function Tokens({ showOwner, tokensOfAddress, noTokensHeader }) {
  const [currentCursorPosition, setCurrentCursorPosition] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [tokensResult, setTokensResult] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useEthers();

  const wikiTokenContract = useWikiTokenContract(/*readOnly=*/ true);
  const tokens = useTokensProvider(tokensResult);

  const handleFetchTokensResult = result => {
    if (result && result.length === 3) {
      let tokens = result[0];
      let hasReachedEnd = result[1];
      // let _ = result[2]; // cursor, unsused.
      setTokensResult(tokens);
      setHasReachedEnd(hasReachedEnd);
    }
  };

  const handleFetchTokensError = () => {
    setTokensResult([]);
  };

  useEffect(() => {
    if (tokensOfAddress) {
      wikiTokenContract
        .tokensOfAddress(account, currentCursorPosition, PAGE_SIZE, true)
        .then(res => handleFetchTokensResult(res))
        .catch(err => {
          console.log("Error fetching tokens of address: ", err);
          handleFetchTokensError();
        });
    } else {
      wikiTokenContract
        .discover(currentCursorPosition, PAGE_SIZE, true)
        .then(res => handleFetchTokensResult(res))
        .catch(err => {
          console.log("Error fetching tokens of address: ", err);
          handleFetchTokensError();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCursorPosition, account]);

  useEffect(() => {
    setIsLoading(false);
  }, [tokens]);

  const onPreviousPage = () => {
    setIsLoading(true);
    setCurrentCursorPosition(Math.max(0, currentCursorPosition - PAGE_SIZE));
  };

  const onNextPage = () => {
    setIsLoading(true);
    setCurrentCursorPosition(currentCursorPosition + PAGE_SIZE);
  };

  return (
    <div className="menu-view">
      {!tokens || isLoading === true ? (
        <Spin indicator={spinIcon} />
      ) : (
        <div>
          {tokens.length === 0 && (
            <div>
              {noTokensHeader}
              <Divider />
            </div>
          )}
          <div hidden={account}>
            Connect a wallet to get started{" "}
            <span role="img" aria-label="rocket">
              🚀
            </span>
            <Divider />
          </div>
          <div hidden={!tokens || tokens.length === 0}>
            {tokens.map(token => {
              return (
                token && (
                  <Token
                    key={token.name}
                    imageUrl={token.meta}
                    pageTitle={token.description}
                    pageId={token.name}
                    showOwner={showOwner}
                  />
                )
              );
            })}
          </div>
          <div className="pagination-container">
            <div
              hidden={currentCursorPosition === 0}
              className="pagination-button"
              onClick={onPreviousPage}
            >
              [<span className="link-span">Prev</span>]
            </div>
            <div
              hidden={!tokens || tokens.length === 0 || hasReachedEnd}
              className="pagination-button"
              onClick={onNextPage}
            >
              [<span className="link-span">Next</span>]
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
