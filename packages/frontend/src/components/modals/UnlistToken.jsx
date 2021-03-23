import React from "react";

import { Modal } from "antd";

export default function UnlistToken(props) {
  return (
    <Modal
      title={props.pageTitle + `" history`}
      visible={props.visible}
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      <p>
        Buyers will still be able to place bids against the page. However, you will need to accept
        them in order to complete the purchase.
      </p>
      <p>You can relist this page at any time.</p>
    </Modal>
  );
}
