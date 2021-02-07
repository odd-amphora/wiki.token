import React, { useState } from "react";

import "antd/dist/antd.css";
import { Form, Input } from "antd";

// TODO(teddywilson) generalize from english
const WIKIPEDIA_URL_PREFIX = `https://en.wikipedia.org/wiki/`;

export default function ClaimToken() {
  const [validateStatus, setValidateStatus] = useState("");

  function fetchPageMetadata(url) {}

  return (
    <div>
      <Form>
        <Form.Item hasFeedback validateStatus={validateStatus}>
          <Input
            placeholder="https://en.wikipedia.org/wiki/Earth"
            onChange={e => {
              const url = e.target.value;
              if (url.startsWith(WIKIPEDIA_URL_PREFIX)) {
                setValidateStatus("validating");
                fetchWikipediaApiData(url.split(WIKIPEDIA_URL_PREFIX)[1]);
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
