import { useContractKit } from "@celo-tools/use-contractkit";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { RomulusKit } from "romulus-kit/dist/src/kit";
import { Box, Button, Card, Flex, Heading, Text, Textarea } from "theme-ui";
import { toWei } from "web3-utils";

import { useAddCommandModal } from "../../../../components/pages/romulus/addCommandModal";
import { governanceLookup } from "../..";
import { BytesLike } from "ethers";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const goBack = () => {
    if (romulusAddress) {
      router.push(`/romulus/${romulusAddress.toString()}`).catch(console.error);
    }
  };
  const { address: romulusAddress } = router.query;
  const governanceName = romulusAddress
    ? governanceLookup[romulusAddress.toString()]
    : "Unknown";
  const { performActions } = useContractKit();
  const [targets, setTargets] = React.useState<string[]>([]);
  const [values, setValues] = React.useState<(number | string)[]>([]);
  const [signatures, setSignatures] = React.useState<string[]>([]);
  const [calldatas, setCalldatas] = React.useState<BytesLike[]>([]);
  const [description, setDescription] = React.useState<string>("");

  const { addCommandModal, openModal } = useAddCommandModal(
    (target, value, signature, calldata) => {
      setTargets([...targets, target]);
      setValues([...values, value]);
      setSignatures([...signatures, signature]);
      setCalldatas([...calldatas, calldata]);
    }
  );

  if (!romulusAddress) {
    return <div>Invalid romulus address</div>;
  }

  const onCreateClick = async () => {
    await performActions(async (connectedKit) => {
      const romulusKit = new RomulusKit(
        connectedKit,
        romulusAddress.toString()
      );
      try {
        const tx = await romulusKit
          ?.propose(targets, values, signatures, calldatas as any, description) // TODO: Hardcoded type
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
          <Box mb={4}>
            <Heading as="h1">Create proposal for {governanceName}</Heading>
          </Box>
          <Box mb={4}>
            <Box mb={2}>
              <Text>Commands</Text>
            </Box>
            <Flex
              sx={{
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {signatures.map((signature, idx) => (
                <Card sx={{ width: "fit-content" }} key={idx} mr={3} mb={2}>
                  <Text>{signature}</Text>
                </Card>
              ))}
              <Button onClick={openModal}>Add</Button>
            </Flex>
          </Box>
          <Box mb={4}>
            <Text>Proposal description</Text>
            <Textarea
              mt={2}
              rows={5}
              placeholder="Enter details about your proposal"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
          </Box>
          <Flex sx={{ justifyContent: "flex-end" }}>
            <Button mr={2} variant="outline" onClick={() => goBack()}>
              Back
            </Button>
            <Button disabled={targets.length === 0} onClick={onCreateClick}>
              Create
            </Button>
          </Flex>
        </Box>
      </Box>
      {addCommandModal}
    </>
  );
};

export default RomulusIndexPage;
