import { useContractKit } from "@celo-tools/use-contractkit";
import { Box, Button, Card, Heading, Text } from "@dracula/dracula-ui";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { RomulusKit } from "romulus-kit/dist/src/kit";
import { toWei } from "web3-utils";

import { useAddCommandModal } from "../../../../components/pages/romulus/addCommandModal";
import { governanceLookup } from "../..";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const goBack = () => {
    router.push(`/romulus/${romulusAddress}`);
  };
  const { address: romulusAddress } = router.query;
  const governanceName = romulusAddress
    ? governanceLookup[romulusAddress.toString()]
    : "Unknown";
  const { performActions } = useContractKit();
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

  if (!romulusAddress) {
    return <div>Invalid romulus address</div>;
  }

  const onCreateClick = async () => {
    performActions(async (connectedKit) => {
      const romulusKit = new RomulusKit(
        connectedKit,
        romulusAddress.toString()
      );
      try {
        const tx = await romulusKit
          ?.propose(targets, values, signatures, calldatas, description)
          ?.send({
            from: connectedKit.defaultAccount,
            gasPrice: toWei("0.1", "gwei"),
          });
        await tx?.waitReceipt();
        goBack();
      } catch (e) {
        alert(e);
      }
    });
  };

  return (
    <>
      <Box>
        <Box>
          <Box mb="md">
            <Heading size="xl">Create proposal for {governanceName}</Heading>
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
