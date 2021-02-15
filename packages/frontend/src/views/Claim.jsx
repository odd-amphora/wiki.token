import React, { useState } from "react";

import "antd/dist/antd.css";
import { Button, Form, Input } from "antd";
import axios from "axios";

import { Token } from "../components";
import { useContractReader } from "../hooks";

// Form validation status
const VALIDATE_STATUS_SUCCESS = "success";
const VALIDATE_STATUS_VALIDATING = "validating";
const VALIDATE_STATUS_ERROR = "error";

// TODO(teddywilson) show error message
export default function Claim({ contracts, signer, transactor }) {
  const [validateStatus, setValidateStatus] = useState("");
  const [articleQueryResponse, setArticleQueryResponse] = useState("");
  const isClaimed = useContractReader(contracts, "Token", "isClaimed", [
    articleQueryResponse?.pageId,
  ]);
  let cancelRequest;

  const fetchArticleMetadata = async article => {
    cancelRequest && cancelRequest();
    const response = await axios.get(
      `${process.env.REACT_APP_METADATA_API_BASE_URL}/api/article/${article}`,
      {
        cancelToken: new axios.CancelToken(function executor(canceler) {
          cancelRequest = canceler;
        }),
      },
    );
    if (response.status === 200) {
      setArticleQueryResponse(response.data);
      setValidateStatus(VALIDATE_STATUS_SUCCESS);
    } else {
      setArticleQueryResponse(null);
      setValidateStatus(VALIDATE_STATUS_ERROR);
    }
  };

  const claim = async () => {
    if (!articleQueryResponse.pageId) {
      throw "No pageId to claim!";
    }
    await transactor(contracts["Token"].connect(signer)["mint"](articleQueryResponse.pageId));
  };

  return (
    <div className="menu-view">
      <Form>
        <Form.Item hasFeedback validateStatus={validateStatus}>
          <Input
            addonBefore="https://en.wikipedia.org/wiki/"
            placeholder="Earth"
            onChange={e => {
              // TODO(teddywilson) fix damn autocomplete latency..
              setValidateStatus(VALIDATE_STATUS_VALIDATING);
              fetchArticleMetadata(e.target.value);
            }}
          />
        </Form.Item>
      </Form>
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
