import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { Divider } from "antd";
import { BigNumber } from "@ethersproject/bignumber";

import { useWikiTokenContract } from "../hooks";
import { MINT_FEE } from "../constants";

export default function About() {
  const wikiTokenContract = useWikiTokenContract();

  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(() => {
    wikiTokenContract
      .totalSupply()
      .then(res => setTotalSupply(res ? BigNumber.from(res).toNumber() : 0))
      .catch(err => {
        console.log(`Error fetching total supply: `, err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="menu-view" id="about-view">
      <>
        <div className="about-text-title">About</div>
        <Divider />
        <div className="about-text-block">
          WikiToken is an{" "}
          <a href="https://ethereum.org/en/developers/docs/standards/tokens/erc-721/">
            ERC721 Token
          </a>{" "}
          built on the <a href="https://ethereum.org">Ethereum</a> blockchain, centered on giving
          back to the <a href="https://wikimediafoundation.org/">Wikimedia Foundation</a>. We are in
          no way associated with Wikimedia, but we hope, over time, we can transfer this project
          over to them.
        </div>
        <div className="about-text-block">
          Wikimedia provides, unarguably, one of the most important education platforms on the
          internet. Since they are non-proft, they rely on the commmunity at large to keep the
          organization running. By owning a WikiToken, or contributing to the project, you are
          contributing to Wikimedia's vision and sustainability.
        </div>
      </>
      <>
        <div className="about-text-title">Mechanism</div>
        <Divider />
        <div className="about-text-block">
          On the site, users can <a href="/sponsor">sponser</a>, or "mint", WikiToken(s) with
          Wikipedia Page URL(s). We have built an API that resolves each Page URL to a{" "}
          <a href="https://www.mediawiki.org/wiki/Manual:Page_table#page_id">Page ID</a> via{" "}
          <a href="https://www.mediawiki.org/wiki/API:Main_page">Wikimedia's API</a>. The Page ID is
          what is ultimately used to ensure that each token is unique.
        </div>
        <div className="about-text-block">
          Each WikiToken costs a flat rate of {MINT_FEE} to mint. This fee is routed to the{" "}
          <a href="https://juicebox.money/#/p/wikitokendao">WikiTokenDAO Juicebox project</a>, which
          holds the WikiToken treasury and funding cycle configuration(s). Secondary sales on{" "}
          <a href="https://opensea.io">Open Sea</a> will incur a small royalty fee (10%) that will
          be routed to the same treasury. This configuration is subject to change as the protocol
          and DAO evolve, but we have set an initial target of 10,000 ETH over the next 100 days.
        </div>
      </>
      <>
        <div className="about-text-title">DAO</div>
        <Divider />
        <div className="about-text-block">
          As a WikiToken holder, you are inherently part of the WikiToken DAO. The end goal is one
          of the following: (a) transfer this project and its treasury to Wikimedia, or (b) hire a
          partner (decided by the community) that manages the finances of the organization and
          routing funds to Wikimedia. Members of the DAO will vote on every single one of these
          decisions.
        </div>
        <div className="about-text-block">
          Currently, the WikiTokenDAO Juicebox project and treasury is owned by{" "}
          <a href="https://etherscan.io/address/0x549238d4ee184e2cb4d3b7dcf47be933d1348fa8">
            wikitoken.eth
          </a>
          , a multisig wallet shared by the creators of WikiToken, as well as other projects in the
          crypto space; some of these include <a link="https://juice.money">Juice</a>,{" "}
          <a href="https://tokentax.co">Token Tax</a>, and more. Immediately after the protocol is
          launched, we plan on adding more members of the DAO to the multisig to enforce stronger
          governance.
        </div>
      </>
      <>
        <div className="about-text-title">Supply</div>
        <Divider />
        <div className="about-text-block">
          There are currently {totalSupply} WikiTokens in circulation. Supply is expected to grow
          over time as new Wikipedia pages are created.
        </div>
      </>
      <>
        <div className="about-text-title">Contributing</div>
        <Divider />
        <div className="about-text-block">
          WikiToken is 100% open source. We are always looking for new members to join our
          community, each with the opportunity to contribute in however they please. If you're
          looking to get started, joining our <a href="https://discord.gg/RdrZKjAEyd">Discord</a>{" "}
          community is a good place to begin. If you've found an issue with the site, please feel
          free to bring it up in the relevant channel there, or (even better) just{" "}
          <a href="https://github.com/odd-amphora/wiki.token/issues">open an issue</a> directly on
          Github. Thank you ❤️
        </div>
      </>
    </div>
  );
}
