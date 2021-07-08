import { BytesLike, ethers } from "ethers";
import React from "react";
import Modal from "react-modal";
import { Box, Button, Flex, Heading, Input, Text } from "theme-ui";
import { TransactionBuilder } from "../../common/TransactionBuilder";

interface IProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddCommandClick: (
    target: string,
    value: number | string,
    signature: string,
    calldata: BytesLike
  ) => void;
}

const AddCommandModal: React.FC<IProps> = ({
  isOpen,
  setIsOpen,
  onAddCommandClick,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      style={{ content: { background: "black" } }}
    >
      <Box>
        <Heading as="h2" mb={2}>
          Add command
        </Heading>
        <TransactionBuilder
          onSubmit={async ({ call, data }) => {
            onAddCommandClick(
              call.target,
              call.value.toString(),
              call.signature,
              data
            );
            setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
        />
      </Box>
    </Modal>
  );
};

export const useAddCommandModal = (
  onAddCommandClick: (
    target: string,
    value: number | string,
    signature: string,
    calldata: BytesLike
  ) => void
) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const addCommandModal = (
    <AddCommandModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onAddCommandClick={(target, value, signature, calldata) => {
        onAddCommandClick(target, value, signature, calldata);
      }}
    />
  );
  const openModal = () => setIsOpen(true);

  return { addCommandModal, openModal };
};
