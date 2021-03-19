import React from "react";

import { Modal } from "antd";

export default function PlaceBid(props) {
  return (
    <Modal
      title={`Place bid on "` + props.pageTitle + `"`}
      visible={props.visible}
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      {!props.bid.hasBid ? <p>No open bids!</p> : <p>Open bid for TODO</p>}
    </Modal>
  );
}
