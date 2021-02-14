import React from "react";
import { Image } from "antd";

export default function Token({ imageUrl, pageId, pageTitle }) {
  function openWikipediaPage() {
    window.open(`https://en.wikipedia.org/?curid=${pageId}`);
  }

  return (
    <div
      className="token"
      onClick={() => {
        openWikipediaPage();
      }}
    >
      <div className="token-wrapper">
        <Image width={196} src={imageUrl} preview={false} />
        <div className="token-text-box">
          <div className="token-page-title">{`"${pageTitle}"`}</div>
          <div className="token-page-id">{pageId}</div>
        </div>
      </div>
    </div>
  );
}
