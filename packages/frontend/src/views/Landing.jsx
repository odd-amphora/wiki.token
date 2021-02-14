import React, { useState } from "react";

import "antd/dist/antd.css";
import { Button, Form, Input } from "antd";

export default function Landing() {
  return (
    <div className="menu-view">
      Wiki Token is an{" "}
      <a href="https://ethereum.org/en/developers/docs/standards/tokens/erc-721/">ERC721 Token</a>{" "}
      built on the Ethereum blockchain centered on giving back to the{" "}
      <a href="https://wikimediafoundation.org/">Wikimedia Foundation</a>.
    </div>
  );
}
