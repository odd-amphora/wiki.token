import React from "react";

import { Modal } from "antd";

export default function WithdrawBid(props) {
  return (
    <Modal
      title={`Withdraw bid for "` + props.pageTitle + `"?`}
      visible={props.visible}
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      <p>
        Funds will be returned to your address when your bid is withdrawn. You can place a new bid
        on this page any time.
      </p>
    </Modal>
  );
}
