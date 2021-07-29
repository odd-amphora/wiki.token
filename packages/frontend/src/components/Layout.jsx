import React from "react";

import Header from "./Header";
// import { Alert } from "antd";

export default function Layout({ children }) {
  return (
    <>
      {/* <Alert
        message={`Network: ${process.env.REACT_APP_INFURA_NETWORK}`}
        type="warning"
        style={{
          visibility: process.env.REACT_APP_INFURA_NETWORK === "mainnet" ? "gone" : "visible",
        }}
      />
      <Alert message="Wiki Token is still in development, use at your own risk" type="error" /> */}
      <Header />
      {children}
    </>
  );
}
