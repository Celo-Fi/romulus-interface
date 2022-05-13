import { useContractKit } from "@celo-tools/use-contractkit";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button, Card, Flex, Heading, Text } from "theme-ui";

import { Address } from "../../common/Address";
import { RomulusDelegate__factory } from "../../../generated";
import { TypedEvent } from "../../../generated/commons";
import { useProposal } from "../../../hooks/romulus/useProposal";
import { useVoteCasts } from "../../../hooks/romulus/useVoteCasts";
import { useVotingTokens } from "../../../hooks/romulus/useVotingTokens";
import { useAsyncState } from "../../../hooks/useAsyncState";
import { useGetConnectedSigner } from "../../../hooks/useProviderOrSigner";
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

export const ProposalDetail: React.FC<IProps> = ({ proposalEvent }) => {
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

  if (!romulusAddress) {
    return <div>Invalid romulus address</div>;
  }

  return (
    <Card>
      <Box mb={1}>
        <Text>
          {proposalEvent.args.description === ""
            ? "No description."
            : proposalEvent.args.description.split("\n").map((line, idx) => (
                <>
                  <Text
                    sx={{
                      display: "block",
                      overflowWrap: "anywhere",
                      paddingBottom: "8px",
                    }}
                    key={idx}
                  >
                    {line}
                  </Text>
                </>
              ))}
        </Text>
      </Box>
    </Card>
  );
};
