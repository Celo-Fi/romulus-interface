import React from "react";
import { useRouter } from "next/dist/client/router";
import { useAsyncState, useRomulus } from "../../../hooks/useRomulus";
import { Proposal, Sort } from "romulus-kit/dist/src/kit";
import { Box, Button, Card, Heading, Text } from "@dracula/dracula-ui";
import { useContractKit } from "@celo-tools/use-contractkit";
import { fromWei, toBN, toWei } from "web3-utils";
import BN from "bn.js";
import { useDelegateModal } from "./delegateModal";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const humanFriendlyWei = (wei: BN) => {
  return Number(fromWei(wei)).toLocaleString();
};

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;
  const { kit, address } = useContractKit();
  const romulusKit = useRomulus(kit, romulusAddress?.toString());

  const proposals = useAsyncState<Array<Proposal>>(
    [],
    romulusKit?.proposals(10, 0, Sort.ASC).then(({ proposals }) => proposals),
    [romulusKit]
  );
  const { tokenVotes, releaseTokenVotes, totalVotes } = useAsyncState(
    { tokenVotes: toBN(0), releaseTokenVotes: toBN(0), totalVotes: toBN(0) },
    romulusKit?.votingPower(address),
    [romulusKit, address, "votes"]
  );
  const { tokenBalance, releaseTokenBalance, totalBalance } = useAsyncState(
    {
      tokenBalance: toBN(0),
      releaseTokenBalance: toBN(0),
      totalBalance: toBN(0),
    },
    romulusKit?.tokenBalance(address),
    [romulusKit, address, "balance"]
  );
  const { tokenDelegate, releaseTokenDelegate } = useAsyncState(
    {
      tokenDelegate: ZERO_ADDRESS,
      releaseTokenDelegate: ZERO_ADDRESS,
    },
    romulusKit?.currentDelegate(address),
    [romulusKit, address, "delegate"]
  );
  const {
    delegateModal: tokenDelegateModal,
    openModal: openTokenDelegateModal,
  } = useDelegateModal(async (delegate) => {
    try {
      const tx = await romulusKit
        ?.delegateToken(delegate)
        ?.send({ from: delegate, gasPrice: toWei("0.1", "gwei") });
      await tx?.waitReceipt();
    } catch (e) {
      alert(e);
    }
  });
  const {
    delegateModal: releaseTokenDelegateModal,
    openModal: openReleaseTokenDelegateModal,
  } = useDelegateModal(async (delegate) => {
    try {
      const tx = await romulusKit
        ?.delegateReleaseToken(delegate)
        ?.send({ from: delegate, gasPrice: toWei("0.1", "gwei") });
      await tx?.waitReceipt();
    } catch (e) {
      alert(e);
    }
  });

  return (
    <>
      <Box>
        <Box mb="md">
          <Heading size="xl">Poof.cash governance</Heading>
        </Box>
        <Box mr="md">
          <Box>
            <Text>
              Voting power:{" "}
              <Text weight="bold">{humanFriendlyWei(totalVotes)}</Text> (
              {humanFriendlyWei(tokenVotes)} token votes +{" "}
              {humanFriendlyWei(releaseTokenVotes)} release token votes)
            </Text>
          </Box>
          <Box>
            <Text>
              Token balance:{" "}
              <Text weight="bold">{humanFriendlyWei(totalBalance)}</Text> (
              {humanFriendlyWei(tokenBalance)} tokens +{" "}
              {humanFriendlyWei(releaseTokenBalance)} release tokens)
            </Text>
          </Box>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Text>
              Token delegate: <Text weight="bold">{tokenDelegate}</Text>{" "}
            </Text>
            <Button ml="sm" size="xs" onClick={openTokenDelegateModal}>
              change
            </Button>
          </Box>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Text>
              Release token delegate:{" "}
              <Text weight="bold">{releaseTokenDelegate}</Text>
            </Text>
            <Button ml="sm" size="xs" onClick={openReleaseTokenDelegateModal}>
              change
            </Button>
          </Box>
        </Box>
        <Box my="md">
          <Heading>Proposals</Heading>
        </Box>
        <Card py="sm">
          <Box style={{ textAlign: "center" }}>
            <Text>Create Proposal</Text>
          </Box>
        </Card>
        {proposals.length > 0 ? (
          proposals.map((proposal, idx) => {
            <Card py="sm" key={idx}>
              <Box>
                <Text>{proposal.id}</Text>
              </Box>
            </Card>;
          })
        ) : (
          <Box mt="md" style={{ textAlign: "center" }}>
            <Text>There are currently no proposals.</Text>
          </Box>
        )}
      </Box>
      {tokenDelegateModal}
      {releaseTokenDelegateModal}
    </>
  );
};

export default RomulusIndexPage;
