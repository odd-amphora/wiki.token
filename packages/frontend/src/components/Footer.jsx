import React from "react";
import { Layout } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";

const FA_ICON_SIZE = "lg";

// TODO(odd-amphora): Make icons clickable
export default function Footer() {
  const openSocialLink = link => {
    window.open(link);
  };

  return (
    <footer className="footer">
      <Layout.Footer className="footer-inner-container">
        <div className="footer-trademark">wiki.token ©2021</div>
        <div style={{ display: "inline-flex", justifyContent: "center" }}>
          <FontAwesomeIcon
            icon={faGithub}
            className="footer-icon"
            size={FA_ICON_SIZE}
            onClick={() => {
              openSocialLink(`https://github.com/teddywilson/wiki.token`);
            }}
          />
          <FontAwesomeIcon
            icon={faTwitter}
            className="footer-icon"
            size={FA_ICON_SIZE}
            onClick={() => {
              openSocialLink(`https://twitter.com/wiki_token`);
            }}
          />
          <FontAwesomeIcon
            icon={faDiscord}
            className="footer-icon"
            size={FA_ICON_SIZE}
            onClick={() => {
              openSocialLink(`https://discord.gg/RdrZKjAEyd`);
            }}
          />
        </div>
      </Layout.Footer>
    </footer>
  );
}
