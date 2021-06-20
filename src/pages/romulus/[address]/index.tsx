import React from "react";
import { useRouter } from "next/dist/client/router";
import { useAsyncState } from "../../../hooks/useAsyncState";
import { Proposal, RomulusKit } from "romulus-kit/dist/src/kit";
import { Box, Button, Heading, Text } from "@dracula/dracula-ui";
import { useContractKit } from "@celo-tools/use-contractkit";
import { toBN, toWei } from "web3-utils";
import { useDelegateModal } from "./delegateModal";
import { governanceLookup } from "..";
import { ProposalCard } from "./ProposalCard";
import { useRomulus } from "../../../hooks/useRomulus";
import { humanFriendlyWei } from "../../../util/number";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;
  const governanceName = romulusAddress
    ? governanceLookup[romulusAddress.toString()]
    : "Unknown";
  const { kit, performActions, address } = useContractKit();
  const romulusKit = useRomulus(kit, romulusAddress?.toString());

  const [proposals, refetchProposals] = useAsyncState<Array<Proposal>>(
    [],
    romulusKit?.proposals(address),
    [romulusKit, address]
  );
  const [hasReleaseToken] = useAsyncState<boolean>(
    false,
    romulusKit?.hasReleaseToken(),
    [romulusKit]
  );
  const [{ totalVotes }, refetchVotes] = useAsyncState(
    { tokenVotes: toBN(0), releaseTokenVotes: toBN(0), totalVotes: toBN(0) },
    romulusKit?.votingPower(address),
    [romulusKit, address]
  );
  const [{ tokenBalance, releaseTokenBalance }] = useAsyncState(
    {
      tokenBalance: toBN(0),
      releaseTokenBalance: toBN(0),
      totalBalance: toBN(0),
    },
    romulusKit?.tokenBalance(address),
    [romulusKit, address]
  );
  const [{ tokenSymbol, releaseTokenSymbol }] = useAsyncState(
    {
      tokenSymbol: "",
      releaseTokenSymbol: "",
    },
    romulusKit?.tokenSymbol(),
    [romulusKit, address]
  );
  const [{ tokenDelegate, releaseTokenDelegate }, refetchDelegates] =
    useAsyncState(
      {
        tokenDelegate: ZERO_ADDRESS,
        releaseTokenDelegate: ZERO_ADDRESS,
      },
      romulusKit?.currentDelegate(address),
      [romulusKit, address]
    );
  const {
    delegateModal: tokenDelegateModal,
    openModal: openTokenDelegateModal,
  } = useDelegateModal(async (delegate) => {
    performActions(async (connectedKit) => {
      const romulusKit = new RomulusKit(
        connectedKit,
        romulusAddress?.toString()
      );
      try {
        const txo = await romulusKit.delegateToken(delegate);
        const tx = await txo.send({
          from: connectedKit.defaultAccount,
          gasPrice: toWei("0.1", "gwei"),
        });
        await tx.waitReceipt();
        refetchVotes();
        refetchDelegates();
      } catch (e) {
        alert(e);
      }
    });
  });

  const {
    delegateModal: releaseTokenDelegateModal,
    openModal: openReleaseTokenDelegateModal,
  } = useDelegateModal(async (delegate) => {
    performActions(async (connectedKit) => {
      const romulusKit = new RomulusKit(
        connectedKit,
        romulusAddress?.toString()
      );
      try {
        const txo = await romulusKit.delegateReleaseToken(delegate);
        if (!txo) {
          alert("Error delegating release token");
          return;
        }
        const tx = await txo.send({
          from: connectedKit.defaultAccount,
          gasPrice: toWei("0.1", "gwei"),
        });
        await tx?.waitReceipt();
        refetchVotes();
        refetchDelegates();
      } catch (e) {
        alert(e);
      }
    });
  });

  return (
    <>
      <Box>
        <Box mb="md">
          <Heading size="xl">{governanceName} governance</Heading>
        </Box>
        <Box mr="md">
          <Box style={{ textAlign: "center" }} mb="lg">
            <Heading size="2xl">{humanFriendlyWei(totalVotes)}</Heading>
            <Text>Voting Power</Text>
          </Box>
          <Box my="md">
            <Heading>Details</Heading>
          </Box>
          <Box>
            <Text>
              Token balance:{" "}
              <Text weight="bold">
                {humanFriendlyWei(tokenBalance)} {tokenSymbol}
              </Text>{" "}
            </Text>
          </Box>
          {hasReleaseToken && releaseTokenBalance.gt(toBN(0)) && (
            <Box>
              <Text>
                Release token balance:{" "}
                <Text weight="bold">
                  {humanFriendlyWei(releaseTokenBalance)} {releaseTokenSymbol}
                </Text>
              </Text>
            </Box>
          )}
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Text>
              Token delegate: <Text weight="bold">{tokenDelegate}</Text>{" "}
            </Text>
            <Button
              ml="sm"
              size="xs"
              onClick={openTokenDelegateModal}
              variant="outline"
            >
              change
            </Button>
          </Box>
          {hasReleaseToken && releaseTokenBalance.gt(toBN(0)) && (
            <Box style={{ display: "flex", alignItems: "center" }}>
              <Text>
                Release token delegate:{" "}
                <Text weight="bold">{releaseTokenDelegate}</Text>
              </Text>
              <Button
                ml="sm"
                size="xs"
                onClick={openReleaseTokenDelegateModal}
                variant="outline"
              >
                change
              </Button>
            </Box>
          )}
        </Box>
        <Box
          my="md"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <Heading>Proposals</Heading>
          <Button
            py="sm"
            onClick={() => {
              router.push(`/romulus/${romulusAddress}/create`);
            }}
          >
            Create Proposal
          </Button>
        </Box>
        {proposals.length > 0 ? (
          proposals.map((proposal, idx) => (
            <Box key={idx} mt="sm">
              <ProposalCard
                proposal={proposal}
                refetchProposals={refetchProposals}
              />
            </Box>
          ))
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
