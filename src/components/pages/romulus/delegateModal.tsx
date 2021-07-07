import { isAddress } from "@ethersproject/address";
import React from "react";
import Modal from "react-modal";
import { Box, Button, Heading, Input, Text } from "theme-ui";

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
      style={{ content: { background: "hsl(230, 25%, 18%)" } }}
    >
      <Box>
        <Box mb={2}>
          <Heading as="h1">Change delegate</Heading>
        </Box>
        <Box mb={2}>
          <Text>Delegate address</Text>
          <Input
            mt={2}
            placeholder="Delegate address"
            onChange={(e) => setDelegate(e.target.value)}
            value={delegate}
          />
        </Box>
        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button mr={2} variant="outline" onClick={() => setIsOpen(false)}>
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
