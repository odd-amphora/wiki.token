import React, { useState, useEffect } from "react";

import "antd/dist/antd.css";
import { Button, Form, Image, Input } from "antd";
import axios from "axios";

import { useContractReader } from "../hooks";

// TODO(teddywilson) generalize from english
const WIKIPEDIA_URL_PREFIX = `https://en.wikipedia.org/wiki/`;

// Form validation status
const VALIDATION_STATUS_SUCCESS = "success";
const VALIDATION_STATUS_VALIDATING = "validating";
const VALIDATION_STATUS_WARNING = "warning";
const VALIDATION_STATUS_ERROR = "error";

// TODO(teddywilson) show error message
export default function Landing({ contracts }) {
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
      setValidateStatus(VALIDATION_STATUS_SUCCESS);
    } else {
      setArticleQueryResponse(null);
      setValidateStatus(VALIDATION_STATUS_ERROR);
    }
  };

  const claim = async () => {
    console.log(`claiming: ${articleQueryResponse?.wikidataId}`);
  };

  return (
    <div style={{ marginLeft: 24, marginRight: 24, marginBottom: 24 }}>
      <Form>
        <Form.Item hasFeedback validateStatus={validateStatus}>
          <Input
            placeholder="https://en.wikipedia.org/wiki/Earth"
            onChange={e => {
              // TODO(teddywilson) Cancel any pending requests?
              const url = e.target.value;
              if (url.startsWith(WIKIPEDIA_URL_PREFIX)) {
                setValidateStatus(VALIDATION_STATUS_VALIDATING);
                fetchArticleMetadata(url.split(WIKIPEDIA_URL_PREFIX)[1]);
              } else {
                setValidateStatus(VALIDATION_STATUS_WARNING);
              }
            }}
          />
        </Form.Item>
      </Form>
      <Image width={196} src={articleQueryResponse?.imageUrl} />
      <div hidden={validateStatus !== VALIDATION_STATUS_SUCCESS}>
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
    </div>
  );
}
