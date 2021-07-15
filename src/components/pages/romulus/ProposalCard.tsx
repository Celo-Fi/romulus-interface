import { useContractKit } from "@celo-tools/use-contractkit";
import { useGetConnectedSigner } from "../../../hooks/useProviderOrSigner";
import { BigNumber } from "ethers";
import moment from "moment";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button, Card, Flex, Heading, Text } from "theme-ui";
import { fromWei } from "web3-utils";
import { RomulusDelegate__factory } from "../../../generated";
import { TypedEvent } from "../../../generated/commons";
import { useVoteCasts } from "../../../hooks/romulus/useVoteCasts";
import { useVotingTokens } from "../../../hooks/romulus/useVotingTokens";

import { useAsyncState } from "../../../hooks/useAsyncState";
import { BIG_ZERO } from "../../../util/constants";
import { humanFriendlyWei } from "../../../util/number";
import { useProposal } from "../../../hooks/romulus/useProposal";
import { ProposalState, Support } from "../../../types/romulus";

interface IProps {
  proposalEvent: TypedEvent<
    [
      BigNumber,
      string,
      string[],
      BigNumber[],
      string[],
      string[],
      BigNumber,
      BigNumber,
      string
    ] & {
      id: BigNumber;
      proposer: string;
      targets: string[];
      values: BigNumber[];
      signatures: string[];
      calldatas: string[];
      startBlock: BigNumber;
      endBlock: BigNumber;
      description: string;
    }
  >;
}

const SECONDS_PER_BLOCK = 5;

export const ProposalCard: React.FC<IProps> = ({ proposalEvent }) => {
  const router = useRouter();
  const getConnectedSigner = useGetConnectedSigner();
  const { address: romulusAddress } = router.query;
  const { kit, address } = useContractKit();
  const [latestBlockNumber] = useAsyncState(0, kit.web3.eth.getBlockNumber);
  const [{ proposal, proposalState }, refetchProposal] = useProposal(
    (romulusAddress as string) || "",
    proposalEvent.args.id
  );
  const [{ votingPower, releaseVotingPower }] = useVotingTokens(
    (romulusAddress as string) || "",
    address
  );
  const [voteCasts] = useVoteCasts((romulusAddress as string) || "");
  const vote = voteCasts[proposalEvent.args.id.toString()];

  const castVote = React.useCallback(async (support: Support) => {
    if (!romulusAddress) {
      return;
    }
    const signer = await getConnectedSigner();
    if (!signer) {
      throw new Error("no signer");
    }
    const romulus = RomulusDelegate__factory.connect(
      romulusAddress as string,
      signer
    );
    await romulus.castVote(proposalEvent.args.id, support);
    refetchProposal();
  }, []);

  let stateStr = "";
  let timeText: string | undefined;
  switch (proposalState) {
    case ProposalState.PENDING:
      stateStr = "Pending";
      const secondsTilStart =
        (Number(latestBlockNumber) -
          Number(proposalEvent.args.startBlock.toString())) *
        SECONDS_PER_BLOCK;
      timeText = `${moment
        .duration(secondsTilStart, "seconds")
        .humanize()} until voting begins`;
      break;
    case ProposalState.ACTIVE:
      stateStr = "Active";
      const secondsTilEnd =
        (Number(proposalEvent.args.endBlock.toString()) -
          Number(latestBlockNumber)) *
        SECONDS_PER_BLOCK;
      timeText = `${moment
        .duration(secondsTilEnd, "seconds")
        .humanize()} until voting ends`;
      break;
    case ProposalState.CANCELED:
      stateStr = "Canceled";
      timeText = "Voting has ended";
      break;
    case ProposalState.DEFEATED:
      stateStr = "Defeated";
      timeText = "Voting has ended";
      break;
    case ProposalState.SUCCEEDED:
      stateStr = "Succeeded";
      timeText = "Voting has ended";
      break;
    case ProposalState.QUEUED:
      stateStr = "Queued";
      timeText = "Voting has ended";
      break;
    case ProposalState.EXPIRED:
      stateStr = "Expired";
      timeText = "Voting has ended";
      break;
    case ProposalState.EXECUTED:
      stateStr = "Executed";
      timeText = "Voting has ended";
      break;
  }

  if (!romulusAddress) {
    return <div>Invalid romulus address</div>;
  }

  let voteContent;

  if (proposalEvent.args.startBlock.gt(latestBlockNumber)) {
    voteContent = <Text>Voting has not started yet.</Text>;
  } else if (votingPower.add(releaseVotingPower).lte(BIG_ZERO)) {
    voteContent = <Text>You have no voting power for this proposalEvent.</Text>;
  } else if (vote) {
    let supportText = <></>;
    if (vote.args.support === Support.FOR) {
      supportText = (
        <>
          <Text sx={{ fontWeight: "display" }}>for</Text> votes
        </>
      );
    } else if (vote.args.support === Support.ABSTAIN) {
      supportText = (
        <>
          <Text sx={{ fontWeight: "display" }}>abstained</Text> votes
        </>
      );
    } else if (vote.args.support === Support.AGAINST) {
      supportText = (
        <>
          <Text sx={{ fontWeight: "display" }}>against</Text> votes
        </>
      );
    }
    voteContent = (
      <Text>
        You made {humanFriendlyWei(fromWei(vote.args.votes.toString()))}{" "}
        {supportText}.
      </Text>
    );
  } else if (proposalEvent.args.endBlock.lt(latestBlockNumber)) {
    voteContent = <Text>Voting has already ended.</Text>;
  } else {
    voteContent = (
      <>
        <Button
          onClick={() => castVote(Support.FOR)}
          disabled={!(proposalState === ProposalState.ACTIVE)}
          mx={2}
        >
          Vote For
        </Button>
        <Button
          onClick={() => castVote(Support.AGAINST)}
          disabled={!(proposalState === ProposalState.ACTIVE)}
          mx={2}
        >
          Vote Against
        </Button>
      </>
    );
  }

  return (
    <Card>
      <Heading>
        Proposal #{proposalEvent.args.id.toString()} ({stateStr})
      </Heading>{" "}
      <Box>
        <Text mr={2}>Proposed by:</Text>
        <Text sx={{ fontWeight: "display" }}>
          {proposalEvent.args.proposer}
        </Text>
      </Box>
      {timeText && (
        <Box>
          <Text mr={2}>Status:</Text>
          <Text sx={{ fontWeight: "display" }}>{timeText}</Text>
        </Box>
      )}
      {proposal && (
        <>
          <Box>
            <Text mr={2}>For votes:</Text>
            <Text sx={{ fontWeight: "display" }}>
              {humanFriendlyWei(proposal?.forVotes.toString())}
            </Text>
          </Box>
          <Box>
            <Text mr={2}>Against votes: </Text>
            <Text sx={{ fontWeight: "display" }}>
              {humanFriendlyWei(proposal?.againstVotes.toString())}
            </Text>
          </Box>
        </>
      )}
      <Box>
        <Text mr={2}>Description:</Text>
        <Text>
          {proposalEvent.args.description === ""
            ? "No description."
            : proposalEvent.args.description}
        </Text>
      </Box>
      <Flex sx={{ justifyContent: "center" }} mt={4}>
        {voteContent}
      </Flex>
    </Card>
  );
};
