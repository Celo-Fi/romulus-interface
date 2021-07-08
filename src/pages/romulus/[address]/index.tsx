import { useContractKit } from "@celo-tools/use-contractkit";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { Proposal, RomulusKit } from "romulus-kit/dist/src/kit";
import { Box, Button, Flex, Heading, Text } from "theme-ui";
import { toBN, toWei } from "web3-utils";

import { useDelegateModal } from "../../../components/pages/romulus/delegateModal";
import { ProposalCard } from "../../../components/pages/romulus/ProposalCard";
import { useAsyncState } from "../../../hooks/useAsyncState";
import { useRomulus } from "../../../hooks/useRomulus";
import { humanFriendlyWei } from "../../../util/number";
import { governanceLookup } from "..";
import { truncateAddress } from "../../../components/layouts/MainLayout/Header";

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
    (async () => {
      if (!address) {
        return [];
      }
      return await romulusKit
        ?.proposals(address)
        .then((proposals) => proposals.slice(1));
    })(),
    [romulusKit, address]
  );
  const [hasReleaseToken] = useAsyncState<boolean>(
    false,
    romulusKit?.hasReleaseToken(),
    [romulusKit]
  );
  const [{ totalVotes }, refetchVotes] = useAsyncState(
    { tokenVotes: toBN(0), releaseTokenVotes: toBN(0), totalVotes: toBN(0) },
    (async () => {
      if (!address) {
        return {
          tokenVotes: toBN(0),
          releaseTokenVotes: toBN(0),
          totalVotes: toBN(0),
        };
      }
      return await romulusKit?.votingPower(address);
    })(),
    [romulusKit, address]
  );
  const [{ tokenBalance, releaseTokenBalance }] = useAsyncState(
    {
      tokenBalance: toBN(0),
      releaseTokenBalance: toBN(0),
      totalBalance: toBN(0),
    },
    (async () => {
      if (!address) {
        return {
          tokenBalance: toBN(0),
          releaseTokenBalance: toBN(0),
          totalBalance: toBN(0),
        };
      }
      return await romulusKit?.tokenBalance(address);
    })(),
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
      (async () => {
        if (!address) {
          return {
            tokenDelegate: ZERO_ADDRESS,
            releaseTokenDelegate: ZERO_ADDRESS,
          };
        }
        return await romulusKit?.currentDelegate(address);
      })(),
      [romulusKit, address]
    );
  const {
    delegateModal: tokenDelegateModal,
    openModal: openTokenDelegateModal,
  } = useDelegateModal(async (delegate) => {
    await performActions(async (connectedKit) => {
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
    await performActions(async (connectedKit) => {
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
        <Box mb={4}>
          <Heading as="h1">{governanceName}</Heading>
        </Box>
        <Box mb={4}>
          <Box style={{ textAlign: "center" }} mb="lg">
            <Heading as="h1">{humanFriendlyWei(totalVotes)}</Heading>
            <Text>Voting Power</Text>
          </Box>
          <Box my="md">
            <Heading as="h2" mb={3}>
              Details
            </Heading>
          </Box>
          <Box sx={{ border: "1px solid white", borderRadius: 8, p: 2, mb: 3 }}>
            <Box mb={2}>
              <Text>Token balance: </Text>
              <Text sx={{ fontWeight: "display" }}>
                {humanFriendlyWei(tokenBalance)} {tokenSymbol}
              </Text>{" "}
            </Box>
            <Flex sx={{ alignItems: "center" }}>
              <Text sx={{ maxWidth: "66%" }} mr={2}>
                Token delegate:{" "}
                <Text sx={{ fontWeight: "display" }}>
                  {truncateAddress(tokenDelegate)}
                </Text>
              </Text>
              <Button
                onClick={openTokenDelegateModal}
                variant="outline"
                p={[2, 2]}
              >
                change
              </Button>
            </Flex>
          </Box>
          {hasReleaseToken && releaseTokenBalance.gt(toBN(0)) && (
            <Box
              sx={{ border: "1px solid white", borderRadius: 8, p: 2, mb: 3 }}
            >
              <Box mb={2}>
                <Text>Release token balance: </Text>
                <Text sx={{ fontWeight: "display" }}>
                  {humanFriendlyWei(releaseTokenBalance)} {releaseTokenSymbol}
                </Text>
              </Box>
              <Flex sx={{ alignItems: "center" }}>
                <Text sx={{ maxWidth: "66%" }} mr={2}>
                  Release token delegate:{" "}
                  <Text sx={{ fontWeight: "display" }}>
                    {truncateAddress(releaseTokenDelegate)}
                  </Text>
                </Text>
                <Button
                  onClick={openReleaseTokenDelegateModal}
                  variant="outline"
                  p={[2, 2]}
                >
                  change
                </Button>
              </Flex>
            </Box>
          )}
        </Box>
        <Box
          mb={4}
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <Heading>Proposals</Heading>
          <Button
            onClick={() => {
              if (romulusAddress) {
                router
                  .push(`/romulus/${romulusAddress.toString()}/create`)
                  .catch(console.error);
              }
            }}
            disabled={totalVotes.lt(toBN(toWei("1000000")))} // TODO: Hardcode
          >
            Create Proposal
          </Button>
        </Box>
        <Box pb={6}>
          {proposals.length > 0 ? (
            proposals.map((proposal, idx) => (
              <Box key={idx} mt={3}>
                <ProposalCard
                  proposal={proposal}
                  refetchProposals={refetchProposals}
                />
              </Box>
            ))
          ) : (
            <Box style={{ textAlign: "center" }}>
              <Text>There are currently no proposals.</Text>
            </Box>
          )}
        </Box>
      </Box>
      {tokenDelegateModal}
      {releaseTokenDelegateModal}
    </>
  );
};

export default RomulusIndexPage;
