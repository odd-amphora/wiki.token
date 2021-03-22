import React from "react";

import { Modal } from "antd";
import web3 from "web3";

// TODO(bingbongle) This reuses many of the same calculates. Use effects and stuff.
// Should display:
// - Bid amount
// - Donation amount
// - How much owner receives
// - How much wiki receieves (with percentage)
export default function PlaceBid(props) {
  return (
    <Modal
      title={`Accept bid for "` + props.pageTitle + `"?`}
      visible={props.visible}
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      <p>{`Bid Amount: ` + props.value + ` ETH`}</p>
      <p>
        {`Donation Amount: ` +
          web3.utils.fromWei(props.donationAmount.toString(), "ether") +
          ` ETH`}
      </p>
      <p>
        {`You receive: ` +
          props.value +
          ` - ` +
          web3.utils.fromWei(props.donationAmount.toString(), "ether") +
          ` = ` +
          `TODO`}
      </p>
    </Modal>
  );
}
