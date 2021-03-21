import React from "react";

import { Modal, InputNumber } from "antd";

export default function PlaceBid(props) {
  return (
    <Modal
      title={`Place bid on "` + props.pageTitle + `"`}
      visible={props.visible}
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      {!props.bid.hasBid ? (
        <p>No open bids! Be the first to place one.</p>
      ) : (
        <p>Open bid for TODO</p>
      )}
      <p>
        If you are outbid, your funds will be returned to your address. You can withdraw your bid at
        any time.
      </p>
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
        onChange={props.onBidAmountChanged}
      />{" "}
      ETH
      <br />
    </Modal>
  );
}
