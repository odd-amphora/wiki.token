import React from "react";
import { PageHeader, Button } from "antd";

export default function Header() {
  return (
    <PageHeader
      ghost={false}
      title="wiki.token"
      extra={[
        <Button type="primary" shape="round" ghost={true}>
          Connect
        </Button>,
      ]}
    />
  );
}
