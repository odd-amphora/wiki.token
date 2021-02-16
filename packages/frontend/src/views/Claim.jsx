import React, { useState, useEffect } from "react";

import "antd/dist/antd.css";
import { Alert, Button, Form, Input } from "antd";
import axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";

import { Token } from "../components";
import { useContractReader } from "../hooks";

// Form validation status
const VALIDATE_STATUS_IDLE = "idle";
const VALIDATE_STATUS_SUCCESS = "success";
const VALIDATE_STATUS_VALIDATING = "validating";
const VALIDATE_STATUS_ERROR = "error";

// TODO(teddywilson) show error message
export default function Claim({ contracts, signer, transactor, web3Modal }) {
  const [validateStatus, setValidateStatus] = useState("");
  const [articleQueryResponse, setArticleQueryResponse] = useState("");
  const [currentPageId, setCurrentPageId] = useState(BigNumber.from(0));
  const isClaimed = useContractReader(contracts, "Token", "isClaimed", [currentPageId]);
  let cancelRequest;

  useEffect(() => {
    setCurrentPageId(
      BigNumber.from(
        articleQueryResponse && articleQueryResponse.pageId ? articleQueryResponse.pageId : 0,
      ),
    );
  }, [articleQueryResponse]);

  const fetchArticleMetadata = async article => {
    cancelRequest && cancelRequest();
    if (!article || article.length === 0) {
      setArticleQueryResponse(null);
      setValidateStatus(VALIDATE_STATUS_IDLE);
      return;
    }
    axios
      .get(`${process.env.REACT_APP_METADATA_API_BASE_URL}/api/article/${article}`, {
        cancelToken: new axios.CancelToken(function executor(canceler) {
          cancelRequest = canceler;
        }),
      })
      .then(response => {
        setArticleQueryResponse(response?.data);
        setValidateStatus(
          response.status === 200 ? VALIDATE_STATUS_SUCCESS : VALIDATE_STATUS_ERROR,
        );
      })
      .catch(error => {
        console.log("Error: ", error);
        setArticleQueryResponse(null);
        setValidateStatus(VALIDATE_STATUS_ERROR);
      });
  };

  const claim = async () => {
    await transactor(contracts["Token"].connect(signer)["mint"](articleQueryResponse?.pageId));
  };

  return (
    <div className="menu-view">
      <Form>
        <Form.Item hasFeedback validateStatus={validateStatus}>
          <Input
            addonBefore="https://en.wikipedia.org/wiki/"
            placeholder="Earth"
            disabled={!web3Modal || !web3Modal.cachedProvider}
            onChange={e => {
              // TODO(teddywilson) fix damn autocomplete latency..
              setValidateStatus(VALIDATE_STATUS_VALIDATING);
              fetchArticleMetadata(e.target.value);
            }}
          />
        </Form.Item>
      </Form>
      {/* For whatever reason, style/visibility isn't working for alert so we have to wrap it */}
      <div hidden={web3Modal && web3Modal.cachedProvider}>
        <Alert message="You must connect a wallet in order to claim tokens 😢" type="error" />
      </div>
      <div hidden={validateStatus !== VALIDATE_STATUS_SUCCESS}>
        <Token
          imageUrl={articleQueryResponse?.imageUrl}
          pageId={articleQueryResponse?.pageId}
          pageTitle={articleQueryResponse?.pageTitle}
        />
        <div hidden={isClaimed}>
          <Button
            onClick={() => {
              claim();
            }}
          >
            Claim
          </Button>
        </div>
        {/* <div
          dangerouslySetInnerHTML={{ __html: articleQueryResponse?.extract }}
          style={{
            textAlign: "left",
          }}
        /> */}
      </div>
    </div>
  );
}
