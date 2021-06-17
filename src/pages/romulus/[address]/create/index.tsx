import React from "react";
import { useRouter } from "next/dist/client/router";
import { useAsyncState, useRomulus } from "../../../../hooks/useRomulus";
import { Proposal, Sort } from "romulus-kit/dist/src/kit";
import { Box, Button, Card, Heading, Input, Text } from "@dracula/dracula-ui";
import { useContractKit } from "@celo-tools/use-contractkit";
import { fromWei, toBN, toWei } from "web3-utils";
import BN from "bn.js";
import { useAddCommandModal } from "./addCommandModal";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const humanFriendlyWei = (wei: BN) => {
  return Number(fromWei(wei)).toLocaleString();
};

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const goBack = () => {
    router.push(`/romulus/${romulusAddress}`);
  };
  const { address: romulusAddress } = router.query;
  const { kit, address } = useContractKit();
  const romulusKit = useRomulus(kit, romulusAddress?.toString());
  const [targets, setTargets] = React.useState<string[]>([]);
  const [values, setValues] = React.useState<(number | string)[]>([]);
  const [signatures, setSignatures] = React.useState<string[]>([]);
  const [calldatas, setCalldatas] = React.useState<(string | number[])[]>([]);
  const [description, setDescription] = React.useState<string>("");

  const { addCommandModal, openModal } = useAddCommandModal(
    (target, value, signature, calldata) => {
      setTargets([target, ...targets]);
      setValues([value, ...values]);
      setSignatures([signature, ...signatures]);
      setCalldatas([calldata, ...calldatas]);
    }
  );
  const onCreateClick = async () => {
    try {
      const tx = await romulusKit
        ?.propose(targets, values, signatures, calldatas, description)
        ?.send({ from: address, gasPrice: toWei("0.1", "gwei") });
      await tx?.waitReceipt();
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <Box>
        <Box>
          <Box mb="md">
            <Heading size="xl">Create proposal for Poof.cash</Heading>
          </Box>
          <Box mb="md">
            <Box>
              <Text>Commands</Text>
            </Box>
            <Box
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {signatures.map((signature, idx) => (
                <Card style={{ width: "fit-content" }} key={idx} p="sm" mr="sm">
                  <Text>{signature}</Text>
                </Card>
              ))}
              <Button onClick={openModal}>Add</Button>
            </Box>
          </Box>
          <Box mb="sm">
            <Text>Proposal description</Text>
            <textarea
              className="drac-input"
              style={{ height: "auto", paddingTop: 4 }}
              rows={5}
              placeholder="Enter details about your proposal"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
          </Box>
          <Box style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button mr="sm" variant="outline" onClick={() => goBack()}>
              Back
            </Button>
            <Button
              disabled={targets.length === 0}
              onClick={async () => {
                await onCreateClick();
                goBack();
              }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Box>
      {addCommandModal}
    </>
  );
};

export default RomulusIndexPage;
