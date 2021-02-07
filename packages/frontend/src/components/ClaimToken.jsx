import React, { useState } from "react";

import "antd/dist/antd.css";
import { Button, Form, Image, Input } from "antd";
import axios from "axios";

// TODO(teddywilson) generalize from english
const WIKIPEDIA_URL_PREFIX = `https://en.wikipedia.org/wiki/`;

// Form validation status
const VALIDATION_STATUS_SUCCESS = "success";
const VALIDATION_STATUS_VALIDATING = "validating";
const VALIDATION_STATUS_WARNING = "warning";
const VALIDATION_STATUS_ERROR = "error";

// TODO(teddywilson) since this is landing page, rename and move somewhere
export default function ClaimToken() {
  const [validateStatus, setValidateStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchArticleMetadata = async article => {
    const response = await axios.get(
      `${process.env.REACT_APP_METADATA_API_BASE_URL}/article?name=${article}`,
    );
    if (response.status == 200) {
      // TODO(teddywilson) use proper default?
      setImageUrl(response.data.thumbnail ? response.data.thumbnail.source : "");
      setValidateStatus(VALIDATION_STATUS_SUCCESS);
    } else {
      // TODO(teddywilson) failure stuff
      setImageUrl("");
      setValidateStatus(VALIDATION_STATUS_ERROR);
    }
  };

  return (
    <div>
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
      <Image width={196} src={imageUrl} />
      <div>
        <Button>Claim</Button>
      </div>
    </div>
  );
}
