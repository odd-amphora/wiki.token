import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/wiki-token" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="📚 wiki.token"
        subTitle="ERC 721 token aimed to give back to Wikipedia"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
