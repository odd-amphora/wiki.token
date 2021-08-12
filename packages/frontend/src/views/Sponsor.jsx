import React, { useState, useEffect } from "react";

import "antd/dist/antd.css";
import { Alert, Button, Form, Input, Select, Switch } from "antd";
import axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";
import web3 from "web3";

import { Token } from "../components";
import { MINT_FEE } from "../constants";
import { useWikiTokenContract } from "../hooks";
import { useContractFunction, useEthers } from "@usedapp/core";

// import  { Switch } from antd;
// import  { CloseOutlined, CheckOutlined } from  antd/icons;

// Form validation status
const VALIDATE_STATUS_IDLE = "idle";
const VALIDATE_STATUS_SUCCESS = "success";
const VALIDATE_STATUS_VALIDATING = "validating";
const VALIDATE_STATUS_ERROR = "error";

const STATE_MINING = "Mining";

const REFRESH_DELAY_MS = 200;
const DEBOUNCE_DELAY_MS = 300;

export default function Sponser() {
  const [articleValidateStatus, setArticleValidateStatus] = useState("");
  const [pageIdValidateStatus, setPageIdValidateStatus] = useState("");

  const [articleQueryResponse, setArticleQueryResponse] = useState("");
  const [currentPageId, setCurrentPageId] = useState(BigNumber.from(0));
  const [isSponsering, setIsSponsering] = useState(false);
  const [isSponsered, setIsSponsered] = useState(false);
  const [useUrl, setUseUrl] = useState(true);

  const { account } = useEthers();
  const wikiTokenContract = useWikiTokenContract();
  const { send, state } = useContractFunction(wikiTokenContract, "mintWikipediaPage");

  const [articleFormValue, setArticleFormValue] = useState("");
  const [pageIdFormValue, setPageIdFormValue] = useState("");

  let cancelRequest;

  const refresh = () => {
    let currentPageId = BigNumber.from(
      articleQueryResponse && articleQueryResponse.pageId ? articleQueryResponse.pageId : 0,
    );
    setCurrentPageId(currentPageId);
    wikiTokenContract
      .isPageMinted(currentPageId)
      .then(res => setIsSponsered(res))
      .catch(err => {
        console.log(`Error checking if page is minted: `, err);
      });
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleQueryResponse, state]);

  useEffect(() => {
    setArticleValidateStatus(VALIDATE_STATUS_VALIDATING);
    let id = setTimeout(() => {
      fetchArticleMetadata(articleFormValue);
    }, DEBOUNCE_DELAY_MS);
    return () => {
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleFormValue]);

  const fetchArticleMetadata = article => {
    cancelRequest && cancelRequest();
    if (!article || article.length === 0) {
      setArticleQueryResponse(null);
      setArticleValidateStatus(VALIDATE_STATUS_IDLE);
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
        setArticleValidateStatus(
          response.status === 200 ? VALIDATE_STATUS_SUCCESS : VALIDATE_STATUS_ERROR,
        );
      })
      .catch(error => {
        console.log("Error: ", error);
        setArticleQueryResponse(null);
        setArticleValidateStatus(VALIDATE_STATUS_ERROR);
      });
  };

  const sponser = async () => {
    setIsSponsering(true);
    // TODO: we should show error message
    send(currentPageId, {
      value: web3.utils.toBN(web3.utils.toWei("0.01", "ether")).toString(),
    });
    setIsSponsering(false);
    setTimeout(() => {
      refresh();
    }, REFRESH_DELAY_MS);
  };

  return (
    <div className="menu-view">
      <Form className="sponser-input" size="large">
        <Switch
          checkedChildren="URL"
          unCheckedChildren="Page ID"
          defaultChecked
          onChange={checked => {
            setUseUrl(checked);
          }}
        />
        <Form.Item
          hasFeedback
          validateStatus={useUrl ? articleValidateStatus : pageIdValidateStatus}
          size="large"
        >
          <Input
            addonBefore={useUrl ? "https://en.wikipedia.org/wiki/" : ""}
            placeholder={useUrl ? "Earth" : "Enter a page id"}
            size="large"
            disabled={!account || isSponsering}
            onChange={e => {
              if (useUrl) {
                setArticleFormValue(e.target.value);
              } else {
                setPageIdFormValue(e.target.value);
              }
            }}
            value={useUrl ? articleFormValue : pageIdFormValue}
          />
        </Form.Item>
      </Form>
      {/* For whatever reason, style/visibility isn't working for alert so we have to wrap it */}
      <div hidden={account}>
        <Alert message="You must connect a wallet in order to sponser tokens 😢" type="error" />
      </div>
      {/* TODO */}
      <div hidden={articleValidateStatus !== VALIDATE_STATUS_SUCCESS}>
        {articleQueryResponse?.pageId && (
          <Token
            key={articleQueryResponse?.pageId}
            imageUrl={articleQueryResponse?.imageUrl}
            pageId={articleQueryResponse?.pageId}
            pageTitle={articleQueryResponse?.pageTitle}
            sponsershipStatus={isSponsered}
            showOwner={true}
          />
        )}
        <div hidden={isSponsered || !account}>
          <Button
            loading={isSponsering || (state && state.status === STATE_MINING)}
            onClick={() => {
              sponser();
            }}
          >
            Sponser for {MINT_FEE}
          </Button>
        </div>
      </div>
    </div>
  );
}
