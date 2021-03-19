import React from "react";

import { Modal } from "antd";
import web3 from "web3";

export default function PurchaseToken(props) {
  return (
    <Modal
      title={`Purchase "` + props.pageTitle + `" for ` + props.offer.price + ` ETH`}
      visible={props.visible}
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      <p>
        {`A donation of ` +
          web3.utils.fromWei(props.donationAmount.toString(), "ether") +
          ` ETH is required in order to purchase this page.`}
      </p>
      <p>
        {`Thus, your total comes to ` +
          props.offer.price +
          ` + ` +
          web3.utils.fromWei(props.donationAmount.toString(), "ether") +
          ` = ` +
          web3.utils.fromWei(
            web3.utils
              .toBN(web3.utils.toWei(props.offer.price, "ether"))
              .add(web3.utils.toBN(props.donationAmount.toString())),
            "ether",
          )}
      </p>
    </Modal>
  );
}
