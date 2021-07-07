import { useContractKit } from "@celo-tools/use-contractkit";
import moment from "moment";
import { useRouter } from "next/router";
import React from "react";
import {
  Proposal,
  ProposalState,
  RomulusKit,
  Support,
} from "romulus-kit/dist/src/kit";
import { Box, Button, Card, Flex, Heading, Text } from "theme-ui";
import { toBN, toWei } from "web3-utils";

import { useAsyncState } from "../../../hooks/useAsyncState";
import { useRomulus } from "../../../hooks/useRomulus";
import { humanFriendlyWei } from "../../../util/number";

interface IProps {
  proposal: Proposal;
  refetchProposals: () => void;
}

const SECONDS_PER_BLOCK = 5;

export const ProposalCard: React.FC<IProps> = ({
  proposal,
  refetchProposals,
}) => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;
  const { kit, performActions } = useContractKit();
  const romulusKit = useRomulus(kit, romulusAddress?.toString());
  const [latestBlockNumber] = useAsyncState(0, kit.web3.eth.getBlockNumber(), [
    kit,
  ]);
  const [proposalState] = useAsyncState(
    ProposalState.PENDING,
    romulusKit?.state(proposal.id),
    [romulusKit, proposal.id]
  );

  let stateStr = "";
  let timeText: string | undefined;
  switch (proposalState) {
    case ProposalState.PENDING:
      stateStr = "Pending";
      const secondsTilStart =
        (Number(latestBlockNumber) - Number(proposal.startBlock)) *
        SECONDS_PER_BLOCK;
      timeText = `${moment
        .duration(secondsTilStart, "seconds")
        .humanize()} until voting begins`;
      break;
    case ProposalState.ACTIVE:
      stateStr = "Active";
      const secondsTilEnd =
        (Number(proposal.endBlock) - Number(latestBlockNumber)) *
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

  if (latestBlockNumber < Number(proposal.startBlock)) {
    voteContent = <Text>Voting has not started yet.</Text>;
  } else if (proposal.votingPower.lte(toBN(0))) {
    voteContent = <Text>You have no voting power for this proposal.</Text>;
  } else if (proposal.hasVoted) {
    let supportText = <></>;
    if (Number(proposal.support) === Support.FOR) {
      supportText = (
        <>
          <Text sx={{ fontWeight: "display" }}>for</Text> votes
        </>
      );
    } else if (Number(proposal.support) === Support.ABSTAIN) {
      supportText = (
        <>
          <Text sx={{ fontWeight: "display" }}>abstained</Text> votes
        </>
      );
    } else if (Number(proposal.support) === Support.AGAINST) {
      supportText = (
        <>
          <Text sx={{ fontWeight: "display" }}>against</Text> votes
        </>
      );
    }
    voteContent = (
      <Text>
        You made {humanFriendlyWei(proposal.votes)} {supportText}.
      </Text>
    );
  } else if (latestBlockNumber > Number(proposal.endBlock)) {
    voteContent = <Text>Voting has already ended.</Text>;
  } else {
    voteContent = (
      <>
        <Button
          onClick={() => {
            performActions(async (connectedKit) => {
              const romulusKit = new RomulusKit(
                connectedKit,
                romulusAddress?.toString()
              );
              await romulusKit?.castVote(proposal.id, Support.FOR).send({
                from: connectedKit.defaultAccount,
                gasPrice: toWei("0.1", "gwei"),
              });
              refetchProposals();
            });
          }}
          disabled={!(proposalState === ProposalState.ACTIVE)}
          mx={2}
        >
          Vote For
        </Button>
        <Button
          onClick={() => {
            performActions(async (connectedKit) => {
              const romulusKit = new RomulusKit(
                connectedKit,
                romulusAddress?.toString()
              );
              await romulusKit?.castVote(proposal.id, Support.AGAINST).send({
                from: connectedKit.defaultAccount,
                gasPrice: toWei("0.1", "gwei"),
              });
              refetchProposals();
            });
          }}
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
        Proposal #{proposal.id} ({stateStr})
      </Heading>{" "}
      <Box>
        <Text mr={2}>Proposed by:</Text>
        <Text sx={{ fontWeight: "display" }}>{proposal.proposer}</Text>
      </Box>
      {timeText && (
        <Box>
          <Text mr={2}>Status:</Text>
          <Text sx={{ fontWeight: "display" }}>{timeText}</Text>
        </Box>
      )}
      <Box>
        <Text mr={2}>For votes:</Text>
        <Text sx={{ fontWeight: "display" }}>
          {humanFriendlyWei(proposal.forVotes)}
        </Text>
      </Box>
      <Box>
        <Text mr={2}>Against votes: </Text>
        <Text sx={{ fontWeight: "display" }}>
          {humanFriendlyWei(proposal.againstVotes)}
        </Text>
      </Box>
      <Box>
        <Text mr={2}>Description:</Text>
        <Text>
          {proposal.description === ""
            ? "No description."
            : proposal.description}
        </Text>
      </Box>
      <Flex sx={{ justifyContent: "center" }} mt={2}>
        {voteContent}
      </Flex>
    </Card>
  );
};
