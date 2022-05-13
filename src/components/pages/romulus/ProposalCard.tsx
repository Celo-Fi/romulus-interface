import { useContractKit } from "@celo-tools/use-contractkit";
import { BigNumber } from "ethers";
import moment from "moment";
import { useRouter } from "next/router";
import React from "react";
import styled from "styled-components";
import { Box, Button, Card, Flex, Heading, Text } from "theme-ui";

import { Address } from "../../../components/common/Address";
import { RomulusDelegate__factory } from "../../../generated";
import { TypedEvent } from "../../../generated/commons";
import { useProposal } from "../../../hooks/romulus/useProposal";
import { useVoteCasts } from "../../../hooks/romulus/useVoteCasts";
import { useVotingTokens } from "../../../hooks/romulus/useVotingTokens";
import { useAsyncState } from "../../../hooks/useAsyncState";
import { useGetConnectedSigner } from "../../../hooks/useProviderOrSigner";
import { ProposalState, Support } from "../../../types/romulus";
import { BIG_ZERO } from "../../../util/constants";
import { humanFriendlyWei } from "../../../util/number";
import { RowBetween } from "../../Row";
import { Moon, Sun, CheckCircle, XCircle } from "react-feather";
import { borderColor } from "polished";

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
  clickable: boolean;
  showId: boolean;
  showAuthor: boolean;
}

const SECONDS_PER_BLOCK = 5;

export const ProposalCard: React.FC<IProps> = ({
  proposalEvent,
  clickable,
  showId,
  showAuthor,
}) => {
  const router = useRouter();
  const getConnectedSigner = useGetConnectedSigner();
  const { address: romulusAddress } = router.query;
  const { kit, address } = useContractKit();
  const [latestBlockNumber] = useAsyncState(0, kit.web3.eth.getBlockNumber);
  const [{ proposal, proposalState }, refetchProposal] = useProposal(
    (romulusAddress as string) || "",
    proposalEvent.args.id
  );

  const onCancelClick = React.useCallback(async () => {
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
    try {
      await romulus.cancel(proposalEvent.args.id);
    } catch (e) {
      console.warn(e);
      alert(e);
    }
    refetchProposal();
  }, []);

  const [{ votingPower, releaseVotingPower }] = useVotingTokens(
    (romulusAddress as string) || "",
    address,
    proposalEvent.args.startBlock
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
  let stateColor = "#909090";
  let votingTimeColor = "#909090";
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
      votingTimeColor = "yellow";
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
      votingTimeColor = "#35D07F";
      break;
    case ProposalState.CANCELED:
      stateStr = "Canceled";
      timeText = "Voting Ended";
      stateColor = "#909090";
      votingTimeColor = "#909090";
      break;
    case ProposalState.DEFEATED:
      stateStr = "Defeated";
      timeText = "Voting Ended";
      votingTimeColor = "#909090";
      break;
    case ProposalState.SUCCEEDED:
      stateStr = "Succeeded";
      timeText = "Voting Ended";
      stateColor = "#35D07F";
      votingTimeColor = "#909090";
      break;
    case ProposalState.QUEUED:
      stateStr = "Queued";
      timeText = "Voting Ended";
      votingTimeColor = "#909090";
      break;
    case ProposalState.EXPIRED:
      stateStr = "Expired";
      timeText = "Voting Ended";
      stateColor = "#909090";
      votingTimeColor = "#909090";
      break;
    case ProposalState.EXECUTED:
      stateStr = "Executed";
      timeText = "Voting Ended";
      stateColor = "#35D07F";
      votingTimeColor = "#909090";
      break;
  }

  if (!romulusAddress) {
    return <div>Invalid romulus address</div>;
  }

  let voteContent;

  if (proposalState === ProposalState.CANCELED) {
    voteContent = <Text>Proposal has been canceled.</Text>;
  } else if (proposalEvent.args.startBlock.gt(latestBlockNumber)) {
    voteContent = <Text>Voting has not started yet.</Text>;
  } else if (votingPower.add(releaseVotingPower).lte(BIG_ZERO)) {
    voteContent = <Text>You have no voting power for this proposal.</Text>;
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
        You made {humanFriendlyWei(vote.args.votes.toString())} {supportText}.
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
    <ClickableCard clickable={clickable}>
      <RowBetween>
        <Box>
          <Flex sx={{ justifyContent: "space-between", paddingLeft: "2px" }}>
            {showId && (
              <Heading>Proposal #{proposalEvent.args.id.toString()}</Heading>
            )}
            {proposalState === ProposalState.ACTIVE && (
              <Text sx={{ cursor: "pointer" }} onClick={onCancelClick}>
                <u>X Cancel</u>
              </Text>
            )}
          </Flex>
          <Box mb={1} style={{ paddingLeft: "2px", marginBottom: "10px" }}>
            {showAuthor ? (
              <Box
                style={{
                  padding: "8px",
                  marginBottom: "24px",
                  border: "2px solid",
                  borderColor: "rgb(149, 128, 255)",
                  borderRadius: "12px",
                }}
              >
                <Box>
                  <Text>Proposal Author</Text>
                </Box>
                <Box>
                  <Text sx={{ fontWeight: "display", fontSize: "14px" }}>
                    <Address value={proposalEvent.args.proposer} />
                  </Text>
                </Box>
              </Box>
            ) : (
              <>
                <Text mr={2}>Proposed by:</Text>
                <Text sx={{ fontWeight: "display" }}>
                  <Address value={proposalEvent.args.proposer} truncate />
                </Text>
              </>
            )}
          </Box>
          {timeText && (
            <Box>
              <Text
                sx={{
                  fontWeight: 500,
                  borderRadius: "8px",
                  backgroundColor: votingTimeColor,
                  fontSize: "14px",
                  padding: "8px",
                }}
              >
                {timeText}
              </Text>
            </Box>
          )}
          <Flex mt={4}>{voteContent}</Flex>
        </Box>
        <Box style={{ width: "200px" }}>
          <Box
            style={{
              padding: "8px",
              border: "3px solid",
              borderRadius: "8px",
              borderColor: stateColor,
              width: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {stateColor === "#909090" ? (
              <XCircle size={20} color={"white"} />
            ) : (
              <CheckCircle size={20} color={"white"} />
            )}
            <Text sx={{ fontWeight: 600, marginLeft: "10px" }}>{stateStr}</Text>
          </Box>
          {proposal && (
            <Box style={{ marginTop: "30px" }}>
              <Box mb={1} style={{ display: "flex" }}>
                <Box style={{ width: "120px" }}>
                  <Text mr={2}>For votes:</Text>
                </Box>

                <Text sx={{ fontWeight: 600 }}>
                  {
                    humanFriendlyWei(proposal?.forVotes.toString()).split(
                      "."
                    )[0]
                  }
                </Text>
              </Box>
              <Box mb={1} style={{ display: "flex" }}>
                <Box style={{ width: "120px" }}>
                  <Text mr={2}>Against votes: </Text>
                </Box>

                <Text sx={{ fontWeight: 600 }}>
                  {
                    humanFriendlyWei(proposal?.againstVotes.toString()).split(
                      "."
                    )[0]
                  }
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </RowBetween>
    </ClickableCard>
  );
};

const ClickableCard = styled(Card)<{
  clickable: boolean;
}>`
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
`;
