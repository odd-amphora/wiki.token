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

  const AboutLink = ({ link, text, external = true }) => {
    return (
      <a target={external === true ? "_blank" : ""} rel="noopener noreferrer" href={link}>
        {text}
      </a>
    );
  };

  return (
    <div className="menu-view" id="about-view">
      <>
        <div className="about-text-title">About</div>
        <Divider />
        <div className="about-text-block">
          WikiToken is an{" "}
          <AboutLink
            link="https://ethereum.org/en/developers/docs/standards/tokens/erc-721/"
            text="ERC721 Token"
          />{" "}
          built on the <AboutLink link="https://ethereum.org" text="Ethereum" /> blockchain,
          centered on giving back to the{" "}
          <AboutLink link="https://wikimediafoundation.org/" text="Wikimedia Foundation" />. We are
          in no way associated with Wikimedia, but we hope, over time, we can transfer this project
          over to them.
        </div>
        {/* <div className="about-text-quote">
          "The mission of the Wikimedia Foundation is to empower and engage people around the world
          to collect and develop educational content under a free license or in the public domain,
          and to disseminate it effectively and globally."
        </div> */}
        <div className="about-text-block">
          Wikimedia provides, unarguably, one of the most important education platforms on the
          internet. Since the organization is non-proft, they rely on the commmunity at large to
          keep the site running and the team paid. With the rise of new Cryptocurrencies and NFTs,
          there is an substantial liquidity that can be routed to help organizations like Wikimedia
          in need. What's unique about WikiToken is that value is provided both to Wikimedia and to
          WikiToken holders. Read more on how the mechanism works below.
        </div>
      </>
      <>
        <div className="about-text-title">Mechanism</div>
        <Divider />
        <div className="about-text-block">
          <p>
            On the site, users can <AboutLink link="/claim" text="claim" external="false" />, or
            "mint", WikiToken(s) with Wikipedia Page URL(s). We have built an API that resolves each
            Page URL to a{" "}
            <AboutLink
              link="https://www.mediawiki.org/wiki/Manual:Page_table#page_id"
              text="Page ID"
            />{" "}
            via{" "}
            <AboutLink link="https://www.mediawiki.org/wiki/API:Main_page" text="Wikimedia's API" />
            . The Page ID is what is ultimately used to ensure that each token is unique. If you
            prefer to interact with the WikiToken contract directly, you will need to use the Page
            ID.
          </p>
          <p>
            Each WikiToken costs a flat rate of {MINT_FEE} to mint, and always will. This fee is
            routed to the WikiTokenDAO Juicebox project, which holds a treasury of funds to be
            donated to Wikimedia, and to pay the maintainers of this project; recurring funding
            targets are set to pay mainters of the project, and overflow funds are considered part
            of the treasury. We anticipate the majority of the treasury to live in overflow.
          </p>
        </div>
      </>
      <>
        <div className="about-text-title">DAO</div>
        <Divider />
        <div className="about-text-block">
          <p>
            As a WikiToken holder, you inherently have a say in the direction of the organization.
            The end goal is to either (a) transfer this project its treasury to Wikimedia, or (b)
            hire a partner (decided by the community) that manage the finances of the organization.
            WikiToken holders will have a say in every decision.
          </p>
          <p>
            The WikiTokenDAO Juicebox project and treasury is owned by the wikitoken.eth address.
            This address is a multisig wallet shared by the creator of the token, and other projects
            in the crypto space. Some of these include the following: TODO.
          </p>
        </div>
      </>
      <>
        <div className="about-text-title">Supply</div>
        <Divider />
        <div className="about-text-block">
          There are currently {totalSupply} WikiTokens in circulation. Supply is expected to grow
          over time as new Wikipedia pages are created. However, we cannot control what happens to
          tokens if a page is removed by Wikimedia. This is rare anyway, so we don't expect it to be
          an issue.
        </div>
      </>
      <>
        <div className="about-text-title">Contributing</div>
        <Divider />
        <div className="about-text-block">
          WikiToken is 100% open source and always will be. We are always looking for new members to
          join our community, each with the opportunity to contribute in however they please. If
          you're looking to get started, joining our{" "}
          <AboutLink link="https://discord.gg/RdrZKjAEyd" text="discord" /> community is a good
          place to begin. If you've found an issue with the site, please feel free to bring it up in
          the relevant channel there, or (even better) just{" "}
          <AboutLink link="https://github.com/odd-amphora/wiki.token/issues" text="open an issue" />{" "}
          directly on Github. Thank you ❤️
        </div>
      </>
    </div>
  );
}
