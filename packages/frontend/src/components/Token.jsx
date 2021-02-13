import React from "react";
import { Image } from "antd";

export default function Token({ imageUrl }) {
  return <Image width={196} src={imageUrl} />;
}
