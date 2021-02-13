import React from "react";
import { Image } from "antd";

import Account from "./Account";

export default function Token({ imageUrl }) {
  return <Image width={196} src={imageUrl} />;
}
