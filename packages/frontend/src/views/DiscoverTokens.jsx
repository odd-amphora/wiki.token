import React from "react";

import { Tokens } from "../components";

export default function DiscoverTokens() {
  return (
    <div>
      <Tokens noTokensHeader={`No tokens have been sponsered... yet 😞`} showOwner={true} />
    </div>
  );
}
