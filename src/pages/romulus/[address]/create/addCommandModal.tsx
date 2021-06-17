import React from "react";
import Modal from "react-modal";
import { Box, Button, Heading, Input, Text } from "@dracula/dracula-ui";
import { ethers } from "ethers";

interface IProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  target: string;
  setTarget: (target: string) => void;
  messageValue: number | string;
  setMessageValue: (value: number | string) => void;
  signature: string;
  setSignature: (signature: string) => void;
  types: string;
  setTypes: (types: string) => void;
  values: string;
  setValues: (values: string) => void;
  onAddCommandClick: (
    target: string,
    value: number | string,
    signature: string,
    calldata: string
  ) => void;
}

const AddCommandModal: React.FC<IProps> = ({
  isOpen,
  setIsOpen,
  target,
  setTarget,
  messageValue,
  setMessageValue,
  signature,
  setSignature,
  types,
  setTypes,
  values,
  setValues,
  onAddCommandClick,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      style={{ content: { background: "var(--black)" } }}
    >
      <Box>
        <Box mb="sm">
          <Heading>Add command</Heading>
        </Box>
        <Box mb="sm">
          <Text>Target</Text>
          <Input
            placeholder="Enter the address to call"
            onChange={(e) => setTarget(e.target.value)}
            value={target}
          />
        </Box>
        <Box mb="sm">
          <Text>Message value</Text>
          <Input
            type="number"
            placeholder="Enter the msg.value"
            onChange={(e) => setMessageValue(e.target.value)}
            value={messageValue}
          />
        </Box>
        <Box mb="sm">
          <Text>Signature</Text>
          <Input
            placeholder="Enter the contract method signature"
            onChange={(e) => setSignature(e.target.value)}
            value={signature}
          />
        </Box>
        <Box mb="sm">
          <Text>Types</Text>
          <Input
            placeholder="Enter a commma separated list of the method's types"
            onChange={(e) => setTypes(e.target.value)}
            value={types}
          />
        </Box>
        <Box mb="sm">
          <Text>Values</Text>
          <Input
            placeholder="Enter a commma separated list of values to pass into the method"
            onChange={(e) => setValues(e.target.value)}
            value={values}
          />
        </Box>
        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button mr="sm" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const abiEncoder = new ethers.utils.AbiCoder();
              const calldata = abiEncoder.encode(
                types.split(","),
                values.split(",")
              );
              onAddCommandClick(target, messageValue, signature, calldata);
              setIsOpen(false);
            }}
          >
            Add
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export const useAddCommandModal = (
  onAddCommandClick: (
    target: string,
    value: number | string,
    signature: string,
    calldata: string | number[]
  ) => void
) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [target, setTarget] = React.useState("");
  const [messageValue, setMessageValue] = React.useState<number | string>("");
  const [signature, setSignature] = React.useState("");
  const [types, setTypes] = React.useState("");
  const [values, setValues] = React.useState("");

  const reset = () => {
    setTarget("");
    setMessageValue("");
    setSignature("");
    setTypes("");
    setValues("");
  };

  const addCommandModal = (
    <AddCommandModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      target={target}
      setTarget={setTarget}
      messageValue={messageValue}
      setMessageValue={setMessageValue}
      signature={signature}
      setSignature={setSignature}
      types={types}
      setTypes={setTypes}
      values={values}
      setValues={setValues}
      onAddCommandClick={(target, value, signature, calldata) => {
        onAddCommandClick(target, value, signature, calldata);
        reset();
      }}
    />
  );
  const openModal = () => setIsOpen(true);

  return { addCommandModal, openModal };
};
