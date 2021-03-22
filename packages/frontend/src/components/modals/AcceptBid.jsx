import React from "react";

import { Modal } from "antd";
import web3 from "web3";

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
          web3.utils.fromWei(props.donationAmountWei.toString(), "ether") +
          ` ETH`}
      </p>
      <p>
        {`You receive: ` +
          props.value +
          ` - ` +
          web3.utils.fromWei(props.donationAmountWei.toString(), "ether") +
          ` = ` +
          web3.utils.fromWei(
            web3.utils
              .toBN(web3.utils.toWei(props.value, "ether"))
              .sub(web3.utils.toBN(props.donationAmountWei))
              .toString(),
            "ether",
          ) +
          " ETH"}
      </p>
    </Modal>
  );
}
