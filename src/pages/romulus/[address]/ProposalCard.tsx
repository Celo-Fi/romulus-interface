import { useContractKit } from "@celo-tools/use-contractkit";
import { Box, Button, Card, Heading, Text } from "@dracula/dracula-ui";
import { useRouter } from "next/router";
import React from "react";
import { Proposal, ProposalState, Support } from "romulus-kit/dist/src/kit";
import { useAsyncState, useRomulus } from "../../../hooks/useRomulus";

interface IProps {
  proposal: Proposal;
}
export const ProposalCard: React.FC<IProps> = ({ proposal }) => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;
  const { kit, address } = useContractKit();
  const romulusKit = useRomulus(kit, romulusAddress?.toString());
  const latestBlockNumber = useAsyncState(0, kit.web3.eth.getBlockNumber(), [
    kit,
  ]);
  const proposalState = useAsyncState(
    ProposalState.PENDING,
    romulusKit?.state(proposal.id),
    [romulusKit, proposal.id]
  );
  let stateStr = "Pending";
  switch (proposalState) {
    case ProposalState.ACTIVE:
      stateStr = "Active";
      break;
    case ProposalState.CANCELED:
      stateStr = "Canceled";
      break;
    case ProposalState.DEFEATED:
      stateStr = "Defeated";
      break;
    case ProposalState.SUCCEEDED:
      stateStr = "Succeeded";
      break;
    case ProposalState.QUEUED:
      stateStr = "Queued";
      break;
    case ProposalState.EXPIRED:
      stateStr = "Expired";
      break;
    case ProposalState.EXECUTED:
      stateStr = "Executed";
      break;
  }

  return (
    <Card p="sm">
      <Heading>
        Proposal #{proposal.id} ({stateStr})
      </Heading>
      <Box>
        <Text>
          Proposed by: <Text weight="bold">{proposal.proposer}</Text>
        </Text>
      </Box>
      <Box>
        <Text>
          Start block: <Text weight="bold">{proposal.startBlock}</Text>
        </Text>
      </Box>
      <Box>
        <Text>
          End block: <Text weight="bold">{proposal.endBlock}</Text>
        </Text>
      </Box>
      <Box>
        <Text>
          For votes: <Text weight="bold">{proposal.forVotes}</Text>
        </Text>
      </Box>
      <Box>
        <Text>
          Abstain votes: <Text weight="bold">{proposal.abstainVotes}</Text>
        </Text>
      </Box>
      <Box>
        <Text>
          Against votes: <Text weight="bold">{proposal.againstVotes}</Text>
        </Text>
      </Box>
      <Box style={{ display: "flex", justifyContent: "center" }} mt="md">
        <Button
          onClick={() =>
            romulusKit
              ?.castVote(proposal.id, Support.FOR)
              .send({ from: address })
              .catch(alert)
          }
          disabled={!(proposalState === ProposalState.ACTIVE)}
          mx="sm"
        >
          Vote For
        </Button>
        <Button
          onClick={() =>
            romulusKit
              ?.castVote(proposal.id, Support.ABSTAIN)
              .send({ from: address })
              .catch(alert)
          }
          disabled={!(proposalState === ProposalState.ACTIVE)}
          mx="sm"
        >
          Vote Abstain
        </Button>
        <Button
          onClick={() =>
            romulusKit
              ?.castVote(proposal.id, Support.AGAINST)
              .send({ from: address })
              .catch(alert)
          }
          disabled={!(proposalState === ProposalState.ACTIVE)}
          mx="sm"
        >
          Vote Against
        </Button>
      </Box>
    </Card>
  );
};
