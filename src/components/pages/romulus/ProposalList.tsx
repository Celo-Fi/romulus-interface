import { BigNumber, BigNumberish } from "ethers";
import { useRouter } from "next/router";
import { Box, Button, Heading } from "theme-ui";
import { useProposals } from "../../../hooks/romulus/useProposals";
import AppBody from "../../../pages/AppBody";
import Loader from "../../Loader";
import { CreateProposalContainer } from "./Header";
import { ProposalCard } from "./ProposalCard";

interface IProps {
  totalVotingPower: BigNumber;
  proposalThreshold: BigNumberish;
}

export const ProposalList: React.FC<IProps> = ({
  totalVotingPower,
  proposalThreshold,
}) => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;
  const [proposals] = useProposals((romulusAddress as string) || "");

  return (
    <AppBody>
      <CreateProposalContainer>
        <Heading as="h2" style={{ fontSize: "1.5rem" }}>
          Governance Proposals
        </Heading>
        {!totalVotingPower.lt(BigNumber.from(proposalThreshold)) && (
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
        )}
      </CreateProposalContainer>
      <Box style={{ paddingBottom: "15px" }}>
        {proposals.length > 1 ? (
          proposals
            .slice(-3)
            .reverse()
            .map((proposalEvent, idx) => (
              <Box key={idx} mt={3} style={{ margin: "32px" }}>
                <ProposalCard
                  proposalEvent={proposalEvent}
                  clickable={false}
                  showId={true}
                  showAuthor={false}
                />
              </Box>
            ))
        ) : (
          <Loader size="48px"></Loader>
        )}
        <Box style={{ margin: "32px" }}>
          <Button
            onClick={() => {
              if (romulusAddress) {
                router
                  .push(`/romulus/${romulusAddress.toString()}/proposals`)
                  .catch(console.error);
              }
            }}
            style={{ width: "100%" }}
          >
            View more proposals
          </Button>
        </Box>
      </Box>
    </AppBody>
  );
};
