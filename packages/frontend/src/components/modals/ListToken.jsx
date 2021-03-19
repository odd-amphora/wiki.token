import React from "react";

import { InputNumber, Modal } from "antd";

export default function ListToken(props) {
  return (
    <Modal
      title={`List "` + props.pageTitle + `" for sale`}
      visible={props.visible}
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      <p>
        By listing this page, buyers will be able to purchase it outright without placing a bid.
      </p>
      <p>You can unlist this page at any time.</p>
      <InputNumber
        style={{
          width: 200,
        }}
        size="large"
        defaultValue="1"
        formatter={value => `$ ${value}`.replace(/[^0-9.]/g, "")}
        parser={value => `$ ${value}`.replace(/[^0-9.]/g, "")}
        min="0"
        step="0.0000001"
        stringMode
        preserve={false}
        onChange={props.onListPriceChange}
      />{" "}
      ETH
      <br />
    </Modal>
  );
}
