import React from "react";

import { Modal } from "antd";

export default function TxHistory(props) {
  return (
    <Modal
      title={`"` + props.pageTitle + `" history`}
      visible={props.visible}
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      {props.events &&
        props.events.length > 0 &&
        props.events.map(event => {
          return (
            <div key={event.transactionHash}>
              <p>{event.transactionHash}</p>
            </div>
          );
        })}
    </Modal>
  );
}
