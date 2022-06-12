import { useContractKit } from "@celo-tools/use-contractkit";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { Box, Button, Flex, Heading, Text } from "theme-ui";
import { useDelegateModal } from "../../../components/pages/romulus/delegateModal";
import { TopDelegates } from "../../../components/pages/romulus/TopDelegates";
import {
  PoofToken__factory,
  RomulusDelegate__factory,
} from "../../../generated";
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
import AppBody from "../../AppBody";
import { RowFlat } from "../../../components/Row";
import { OverviewCard } from "../../../components/pages/romulus/OverviewCard";
import { ProposalList } from "../../../components/pages/romulus/ProposalList";
import { DetailContainer } from "../../../components/pages/romulus/Header";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;
  const getConnectedSigner = useGetConnectedSigner();
  const provider = useProvider();
  const governanceDescription = romulusAddress
    ? governanceLookup[romulusAddress.toString()]
    : undefined;
  const { address } = useContractKit();
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
        <OverviewCard
          governanceDescription={governanceDescription}
        ></OverviewCard>
        <AppBody>
          <Box mb={4}>
            <RowFlat>
              <Box my="md" sx={{ margin: "25px auto 25px auto" }}>
                <Heading as="h2" mb={3} style={{ fontSize: "1.25rem" }}>
                  User Details
                </Heading>
                <DetailContainer>
                  <Box mb={2}>
                    <Text>Token Balance: </Text>
                    <Text sx={{ fontWeight: "display" }}>
                      {humanFriendlyWei(balance.toString())} {tokenSymbol}
                    </Text>{" "}
                  </Box>
                  <Box mb={2}>
                    <Text>Voting Power: </Text>
                    <Text sx={{ fontWeight: "display" }}>
                      {humanFriendlyWei(totalVotingPower.toString())}
                    </Text>{" "}
                  </Box>
                  <Flex sx={{ alignItems: "center" }}>
                    <Text sx={{ maxWidth: "66%" }} mr={2}>
                      Token Delegate:{" "}
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
                </DetailContainer>
              </Box>
              <Box my="md" sx={{ margin: "25px auto 25px auto" }}>
                <Heading as="h2" mb={3} style={{ fontSize: "1.25rem" }}>
                  Governance Details
                </Heading>
                <DetailContainer>
                  <Box mb={2}>
                    <Text>Quorum: </Text>
                    <Text sx={{ fontWeight: "display" }}>
                      {humanFriendlyWei(quorumVotes.toString())} {tokenSymbol}
                    </Text>{" "}
                  </Box>
                  <Box mb={2}>
                    <Text>Proposal Threshold: </Text>
                    <Text sx={{ fontWeight: "display" }}>
                      {humanFriendlyWei(proposalThreshold.toString())}{" "}
                      {tokenSymbol}
                    </Text>{" "}
                  </Box>
                </DetailContainer>
              </Box>
            </RowFlat>

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
        </AppBody>

        <ProposalList
          proposalThreshold={proposalThreshold}
          totalVotingPower={totalVotingPower}
        ></ProposalList>

        <TopDelegates romulusAddress={romulusAddress as string} />
      </Box>
      {tokenDelegateModal}
      {releaseTokenDelegateModal}
    </>
  );
};

export default RomulusIndexPage;
