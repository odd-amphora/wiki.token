import React from "react";
import { Layout } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faDiscord, faMedium, faTwitter } from "@fortawesome/free-brands-svg-icons";

const FA_ICON_SIZE = "lg";

// TODO(teddywilson): Make icons clickable
export default function Footer() {
  return (
    <Layout.Footer style={{ textAlign: "center" }}>
      <div>wiki.token ©2021</div>
      <div style={{ display: "inline-flex", justifyContent: "center" }}>
        <FontAwesomeIcon icon={faGithub} className="footer-icon" size={FA_ICON_SIZE} />
        <FontAwesomeIcon icon={faMedium} className="footer-icon" size={FA_ICON_SIZE} />
        <FontAwesomeIcon icon={faTwitter} className="footer-icon" size={FA_ICON_SIZE} />
        <FontAwesomeIcon icon={faDiscord} className="footer-icon" size={FA_ICON_SIZE} />
      </div>
    </Layout.Footer>
  );
}
