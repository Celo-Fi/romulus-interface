import React from "react";
import Modal from "react-modal";
import { Box, Button, Heading, Input, Text } from "@dracula/dracula-ui";
import { isAddress } from "@ethersproject/address";

interface IProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  delegate: string;
  setDelegate: (delegate: string) => void;
  onDelegateClick: (delegate: string) => Promise<void>;
}

const DelegateModal: React.FC<IProps> = ({
  isOpen,
  setIsOpen,
  delegate,
  setDelegate,
  onDelegateClick,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      style={{ content: { background: "var(--black)" } }}
    >
      <Box>
        <Box mb="sm">
          <Heading>Change delegate</Heading>
        </Box>
        <Box mb="sm">
          <Text>Delegate address</Text>
          <Input
            placeholder="Delegate address"
            onChange={(e) => setDelegate(e.target.value)}
            value={delegate}
          />
        </Box>
        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button mr="sm" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isAddress(delegate)}
            onClick={async () => {
              await onDelegateClick(delegate);
              setIsOpen(false);
            }}
          >
            Delegate
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export const useDelegateModal = (
  onDelegateClick: (delegate: string) => Promise<void>
) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [delegate, setDelegate] = React.useState("");

  const delegateModal = (
    <DelegateModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      delegate={delegate}
      setDelegate={setDelegate}
      onDelegateClick={onDelegateClick}
    />
  );
  const openModal = () => setIsOpen(true);

  return { delegateModal, openModal };
};
