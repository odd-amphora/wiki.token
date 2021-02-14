import React, { useEffect, useState } from "react";

import "antd/dist/antd.css";
import { Divider } from "antd";

export default function About({ totalSupply }) {
  return (
    <div className="menu-view">
      <div className="about-text-block" id="heading">
        Wiki Token is an{" "}
        <a href="https://ethereum.org/en/developers/docs/standards/tokens/erc-721/">ERC721 Token</a>{" "}
        built on the Ethereum blockchain centered on giving back to the{" "}
        <a href="https://wikimediafoundation.org/">Wikimedia Foundation</a>.
      </div>
      <Divider />
      <div className="about-text-block" id="subheading">
        Claim, or "mint", a Wiki Token with a Wikipedia page URL. The{" "}
        <a href="https://www.mediawiki.org/wiki/Manual:Page_table#page_id">page ID</a> will be used
        to ensure that your token is unique.
      </div>
      <Divider />
      <div className="about-text-counter" id="heading">
        Total # of Wiki Tokens in circulation:
      </div>
      <div className="about-text-counter" id="subheading">
        {totalSupply}
      </div>
    </div>
  );
}
