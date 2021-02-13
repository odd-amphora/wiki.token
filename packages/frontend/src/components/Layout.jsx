import React from "react";

import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ address, onConnectWallet, children }) {
  return (
    <>
      <Header address={address} onConnectWallet={onConnectWallet} />
      {children}
      <Footer />
    </>
  );
}
