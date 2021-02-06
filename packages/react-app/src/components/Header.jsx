import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a
      href="https://github.com/austintgriffith/wiki.token"
      target="_blank"
      rel="noopener noreferrer"
    >
      <PageHeader
        title="🏗 wiki.token"
        subTitle="forkable Ethereum dev stack focused on fast product iteration"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
