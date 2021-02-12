import React, { useState, useEffect } from "react";

import "antd/dist/antd.css";
import { Button, Form, Image, Input } from "antd";
import axios from "axios";

import { useContractReader } from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";

// TODO(teddywilson) generalize from english
const WIKIPEDIA_URL_PREFIX = `https://en.wikipedia.org/wiki/`;

// Form validation status
const VALIDATE_STATUS_SUCCESS = "success";
const VALIDATE_STATUS_VALIDATING = "validating";
const VALIDATE_STATUS_WARNING = "warning";
const VALIDATE_STATUS_ERROR = "error";

// TODO(teddywilson) show error message
export default function Landing({ contracts, signer, transactor }) {
  const [validateStatus, setValidateStatus] = useState("");
  const [articleQueryResponse, setArticleQueryResponse] = useState("");
  const isClaimed = useContractReader(contracts, "Token", "isClaimed", [
    articleQueryResponse?.wikidataId,
  ]);

  const fetchArticleMetadata = async article => {
    const response = await axios.get(
      `${process.env.REACT_APP_METADATA_API_BASE_URL}/article?name=${article}`,
    );
    if (response.status == 200) {
      setArticleQueryResponse(response.data);
      setValidateStatus(VALIDATE_STATUS_SUCCESS);
    } else {
      setArticleQueryResponse(null);
      setValidateStatus(VALIDATE_STATUS_ERROR);
    }
  };

  const claim = async () => {
    if (!articleQueryResponse.wikidataId) {
      throw "No wikidataId to claim!";
    }
    await transactor(contracts["Token"].connect(signer)["mint"](articleQueryResponse.wikidataId));
  };

  return (
    <div style={{ marginLeft: 24, marginRight: 24, marginBottom: 24 }}>
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
        <Image width={196} src={articleQueryResponse?.imageUrl} />
        <div>
          {isClaimed ? (
            <Button>Not sure yet?</Button>
          ) : (
            <Button
              onClick={() => {
                claim();
              }}
            >
              Claim
            </Button>
          )}
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: articleQueryResponse?.extract }}
          style={{
            textAlign: "left",
          }}
        />
      </div>
    </div>
  );
}
