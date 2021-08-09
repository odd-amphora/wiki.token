import React from "react";

import { Tokens } from "../components";

export default function TokensOfAddress() {
  return (
    <Tokens
      noTokensHeader={`You haven't sponsered any tokens... yet 😞`}
      showOwner={false}
      tokensOfAddress={true}
    />
  );
}
