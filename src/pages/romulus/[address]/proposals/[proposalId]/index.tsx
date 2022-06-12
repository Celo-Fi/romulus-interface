import { useRouter } from "next/dist/client/router";
import React, { useEffect, useState } from "react";
import { Box, Heading } from "theme-ui";
import { useProposals } from "../../../../../hooks/romulus/useProposals";
import { governanceLookup } from "../../..";
import AppBody from "../../../../AppBody";
import { ProposalDetail } from "../../../../../components/pages/romulus/ProposalDetail";
import Loader from "../../../../../components/Loader";
import { ProposalCard } from "../../../../../components/pages/romulus/ProposalCard";
import { ArrowLeft } from "react-feather";
import { ProtocolImage } from "../../../../../components/Image";
import { ReturnRoute } from "../../../../../components/Button";
import {
  DetailsHeaderContainer,
  ProposalHeaderContainer,
} from "../../../../../components/pages/romulus/Header";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const [proposal, setProposal] = useState<any>(undefined);
  const [proposalIdDisplay, setProposalIdDisplay] = useState("");
  const { address: romulusAddress } = router.query;
  const governanceDescription = romulusAddress
    ? governanceLookup[romulusAddress.toString()]
    : undefined;
  const [proposals] = useProposals((romulusAddress as string) || "");

  useEffect(() => {
    if (proposals.length > 1) {
      const foundProp = proposals.find(
        (prop) => prop.args.id.toString() === router.query.proposalId
      );
      setProposal(foundProp);
    }
  }, [proposals, router]);

  useEffect(() => {
    if (proposal) {
      console.log(proposal.args.id.toString().length);
      if (proposal.args.id.toString().length === 1) {
        setProposalIdDisplay(`Proposal 00${proposal.args.id.toString()}`);
      } else {
        setProposalIdDisplay(`Proposal 0${proposal.args.id.toString()}`);
      }
    }
  }, [proposal]);

  return (
    <>
      <Box style={{ marginTop: "45px" }}>
        <ReturnRoute
          onClick={() => {
            if (romulusAddress) {
              router
                .push(`/romulus/${romulusAddress.toString()}/proposals`)
                .catch(console.error);
            }
          }}
        >
          <ArrowLeft size={48} color={"white"}></ArrowLeft>
          <Heading
            as="h2"
            style={{ fontSize: "2rem", marginTop: "4px", marginLeft: "12px" }}
          >
            Proposals
          </Heading>
        </ReturnRoute>
        <AppBody>
          {proposal ? (
            <>
              <ProposalHeaderContainer>
                {governanceDescription && (
                  <ProtocolImage src={governanceDescription.icon} />
                )}
                <Heading
                  as="h2"
                  style={{ fontSize: "1.75rem", marginTop: "4px" }}
                >
                  {governanceDescription ? governanceDescription.name : ""}{" "}
                  {proposalIdDisplay}
                </Heading>
              </ProposalHeaderContainer>
              <Box style={{ paddingBottom: "15px" }}>
                <Box style={{ margin: "32px" }}>
                  <ProposalCard
                    proposalEvent={proposal}
                    clickable={false}
                    showId={false}
                    showAuthor={true}
                  />
                </Box>
              </Box>
              <DetailsHeaderContainer>
                <Heading as="h2" style={{ fontSize: "1.75rem" }}>
                  Details
                </Heading>
              </DetailsHeaderContainer>

              <Box style={{ margin: "32px", paddingBottom: "45px" }}>
                <ProposalDetail proposalEvent={proposal} />
              </Box>
            </>
          ) : (
            <>
              <Box style={{ margin: "45px", padding: "128px" }}>
                <Loader size="48px"></Loader>
              </Box>
            </>
          )}
        </AppBody>
      </Box>
    </>
  );
};

export default RomulusIndexPage;
