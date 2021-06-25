import { useContractKit } from "@celo-tools/use-contractkit";
import { Box, Button, Card, Heading, Text } from "@dracula/dracula-ui";
import moment from "moment";
import { useRouter } from "next/router";
import React from "react";
import {
  Proposal,
  ProposalState,
  RomulusKit,
  Support,
} from "romulus-kit/dist/src/kit";
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
          <Text weight="bold">for</Text> votes
        </>
      );
    } else if (Number(proposal.support) === Support.ABSTAIN) {
      supportText = (
        <>
          <Text weight="bold">abstained</Text> votes
        </>
      );
    } else if (Number(proposal.support) === Support.AGAINST) {
      supportText = (
        <>
          <Text weight="bold">against</Text> votes
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
          mx="sm"
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
          mx="sm"
        >
          Vote Against
        </Button>
      </>
    );
  }

  return (
    <Card p="sm" color="blackLight" mb="md">
      <Heading>
        Proposal #{proposal.id} ({stateStr})
      </Heading>{" "}
      <Box>
        <Text>
          Proposed by: <Text weight="bold">{proposal.proposer}</Text>
        </Text>
      </Box>
      {timeText && (
        <Box>
          <Text>
            Status: <Text weight="bold">{timeText}</Text>
          </Text>
        </Box>
      )}
      <Box>
        <Text>
          For votes:{" "}
          <Text weight="bold">{humanFriendlyWei(proposal.forVotes)}</Text>
        </Text>
      </Box>
      <Box>
        <Text>
          Against votes:{" "}
          <Text weight="bold">{humanFriendlyWei(proposal.againstVotes)}</Text>
        </Text>
      </Box>
      <Box>
        <Text>Description: {proposal.description}</Text>
      </Box>
      <Box style={{ display: "flex", justifyContent: "center" }} mt="md">
        {voteContent}
      </Box>
    </Card>
  );
};
