import React from "react";
import { Image } from "antd";

export default function Token({ imageUrl, pageId, pageTitle }) {
  return (
    <div className="token">
      <div className="token-wrapper">
        <Image width={196} src={imageUrl} />
        <div className="token-text-box">
          <div className="token-page-title">{`"${pageId}"`}</div>
          <div className="token-page-id">{pageTitle}</div>
        </div>
      </div>
    </div>
  );
}
