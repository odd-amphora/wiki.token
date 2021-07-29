import React from "react";
import { PageHeader } from "antd";

import Account from "./Account";

export default function Header() {
  return <PageHeader ghost={false} title="wiki.token" extra={[<Account key="0" />]} />;
}
