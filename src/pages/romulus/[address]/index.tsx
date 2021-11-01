import { useContractKit } from "@celo-tools/use-contractkit";
import { BigNumber } from "ethers";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { Box, Button, Flex, Heading, Text } from "theme-ui";

import { useDelegateModal } from "../../../components/pages/romulus/delegateModal";
import { ProposalCard } from "../../../components/pages/romulus/ProposalCard";
import { TopDelegates } from "../../../components/pages/romulus/TopDelegates";
import {
  PoofToken__factory,
  RomulusDelegate__factory,
} from "../../../generated";
import { useProposals } from "../../../hooks/romulus/useProposals";
import { useRomulus } from "../../../hooks/romulus/useRomulus";
import { useVotingTokens } from "../../../hooks/romulus/useVotingTokens";
import { useLatestBlockNumber } from "../../../hooks/useLatestBlockNumber";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../hooks/useProviderOrSigner";
import { truncateAddress } from "../../../util/address";
import { BIG_ZERO } from "../../../util/constants";
import { humanFriendlyWei } from "../../../util/number";
import { governanceLookup } from "..";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;
  const getConnectedSigner = useGetConnectedSigner();
  const provider = useProvider();
  const governanceName = romulusAddress
    ? governanceLookup[romulusAddress.toString()]
    : "Unknown";
  const { address } = useContractKit();
  const [proposals] = useProposals((romulusAddress as string) || "");
  const [
    [
      hasReleaseToken,
      tokenSymbol,
      releaseTokenSymbol,
      tokenDelegate,
      releaseTokenDelegate,
      quorumVotes,
      proposalThreshold,
    ],
    refetchRomulus,
  ] = useRomulus((romulusAddress as string) || "");
  const [latestBlockNumber] = useLatestBlockNumber();
  const [
    { balance, releaseBalance, votingPower, releaseVotingPower },
    refetchVotingTokens,
  ] = useVotingTokens(
    (romulusAddress as string) || "",
    address,
    latestBlockNumber
  );
  const totalVotingPower = votingPower.add(releaseVotingPower);

  const {
    delegateModal: tokenDelegateModal,
    openModal: openTokenDelegateModal,
  } = useDelegateModal(async (delegate) => {
    try {
      if (!romulusAddress) {
        console.warn("No romulus address");
        return;
      }
      const signer = await getConnectedSigner();
      const romulus = RomulusDelegate__factory.connect(
        romulusAddress as string,
        provider
      );
      const token = PoofToken__factory.connect(await romulus.token(), signer);
      await token.delegate(delegate);
    } catch (e) {
      alert(e);
    } finally {
      refetchVotingTokens();
      refetchRomulus();
    }
  });

  const {
    delegateModal: releaseTokenDelegateModal,
    openModal: openReleaseTokenDelegateModal,
  } = useDelegateModal(async (delegate) => {
    try {
      if (!romulusAddress) {
        console.warn("No romulus address");
        return;
      }
      const signer = await getConnectedSigner();
      const romulus = RomulusDelegate__factory.connect(
        romulusAddress as string,
        provider
      );
      const token = PoofToken__factory.connect(
        await romulus.releaseToken(),
        signer
      );
      await token.delegate(delegate);
    } catch (e) {
      alert(e);
    } finally {
      refetchVotingTokens();
      refetchRomulus();
    }
  });

  return (
    <>
      <Box>
        <Box mb={4}>
          <Heading as="h1">{governanceName}</Heading>
        </Box>
        <Box mb={4}>
          <Box style={{ textAlign: "center" }} mb="lg">
            <Heading as="h1">
              {humanFriendlyWei(totalVotingPower.toString())}
            </Heading>
            <Text>Voting Power</Text>
          </Box>
          <Box my="md">
            <Heading as="h2" mb={3}>
              User details
            </Heading>
          </Box>
          <Box sx={{ border: "1px solid white", borderRadius: 8, p: 2, mb: 3 }}>
            <Box mb={2}>
              <Text>Token balance: </Text>
              <Text sx={{ fontWeight: "display" }}>
                {humanFriendlyWei(balance.toString())} {tokenSymbol}
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
          <Box my="md">
            <Heading as="h2" mb={3}>
              Governance details
            </Heading>
          </Box>
          <Box sx={{ border: "1px solid white", borderRadius: 8, p: 2, mb: 3 }}>
            <Box mb={2}>
              <Text>Quorum: </Text>
              <Text sx={{ fontWeight: "display" }}>
                {humanFriendlyWei(quorumVotes.toString())} {tokenSymbol}
              </Text>{" "}
            </Box>
            <Box mb={2}>
              <Text>Proposal threshold: </Text>
              <Text sx={{ fontWeight: "display" }}>
                {humanFriendlyWei(proposalThreshold.toString())} {tokenSymbol}
              </Text>{" "}
            </Box>
          </Box>
          {hasReleaseToken && releaseBalance.gt(BIG_ZERO) && (
            <Box
              sx={{ border: "1px solid white", borderRadius: 8, p: 2, mb: 3 }}
            >
              <Box mb={2}>
                <Text>Release token balance: </Text>
                <Text sx={{ fontWeight: "display" }}>
                  {humanFriendlyWei(releaseBalance.toString())}{" "}
                  {releaseTokenSymbol}
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
        <Box>
          <Heading as="h2" mb={3}>
            Top delegates
          </Heading>
          <TopDelegates romulusAddress={romulusAddress as string} />
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
            disabled={totalVotingPower.lt(BigNumber.from(proposalThreshold))}
          >
            Create Proposal
          </Button>
        </Box>
        <Box pb={6}>
          {proposals.length > 1 ? (
            proposals
              .slice(1)
              .reverse()
              .map((proposalEvent, idx) => (
                <Box key={idx} mt={3}>
                  <ProposalCard proposalEvent={proposalEvent} />
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
