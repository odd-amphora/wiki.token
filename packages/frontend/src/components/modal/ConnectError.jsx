import React from "react";
import { Modal } from "antd";

export default function ConnectError({ isVisible, onClose }) {
  return (
    <Modal
      title="Error connecting wallet"
      visible={isVisible}
      onCancel={onClose}
      onOk={onClose}
      onClose={onClose}
    >
      <span>
        There was an error connecting to your wallet provider. Please make sure you have{" "}
        <a href="https://metamask.io/download">Metamask</a> installed and a wallet connected.
      </span>
    </Modal>
  );
}
