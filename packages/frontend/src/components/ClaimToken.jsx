import React, { useState } from "react";

import "antd/dist/antd.css";
import { Form, Input } from "antd";
import axios from "axios";

// TODO(teddywilson) generalize from english
const WIKIPEDIA_URL_PREFIX = `https://en.wikipedia.org/wiki/`;

export default function ClaimToken() {
  const [validateStatus, setValidateStatus] = useState("");
  const cancelTokenSource = axios.CancelToken.source();

  const fetchArticleMetadata = async article => {
    const response = await axios.get(
      `${process.env.REACT_APP_METADATA_API_BASE_URL}/article?name=${article}`,
    );
    console.log(response);
  };

  return (
    <div>
      <Form>
        <Form.Item hasFeedback validateStatus={validateStatus}>
          <Input
            placeholder="https://en.wikipedia.org/wiki/Earth"
            onChange={e => {
              // Cancel any pending requests
              const url = e.target.value;
              if (url.startsWith(WIKIPEDIA_URL_PREFIX)) {
                setValidateStatus("validating");
                fetchArticleMetadata(url.split(WIKIPEDIA_URL_PREFIX)[1]);
              } else {
                setValidateStatus("warning");
              }
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
