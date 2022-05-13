import { useRouter } from "next/dist/client/router";
import React, { useEffect, useState } from "react";
import { Box, Heading, Image } from "theme-ui";
import { useProposals } from "../../../../../hooks/romulus/useProposals";
import { governanceLookup } from "../../..";
import styled from "styled-components";
import AppBody from "../../../../AppBody";
import { ProposalDetail } from "../../../../../components/pages/romulus/ProposalDetail";
import Loader from "../../../../../components/Loader";
import { Card } from "theme-ui";
import { useProposal } from "../../../../../hooks/romulus/useProposal";
import { ProposalCard } from "../../../../../components/pages/romulus/ProposalCard";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const [proposal, setProposal] = useState<any>(undefined);
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

  return (
    <>
      <Box style={{ marginTop: "45px" }}>
        <AppBody>
          {proposal ? (
            <>
              <Box
                mb={4}
                style={{
                  display: "flex",
                  padding: "45px 45px 25px 45px",
                }}
              >
                {governanceDescription && (
                  <ProtocolImage src={governanceDescription.icon} />
                )}
                <Heading
                  as="h2"
                  style={{ fontSize: "1.75rem", marginTop: "4px" }}
                >
                  {governanceDescription ? governanceDescription.name : ""}{" "}
                  Proposal 00{proposal.args.id.toString()}
                </Heading>
              </Box>
              <Box pb={6} style={{ paddingBottom: "15px" }}>
                <Box mt={3} style={{ margin: "32px" }}>
                  <ProposalCard
                    proposalEvent={proposal}
                    clickable={false}
                    showId={false}
                    showAuthor={true}
                  />
                </Box>
              </Box>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "25px 45px 0px 45px",
                  borderTop: "1px solid",
                  borderColor: "rgba(0, 0, 0, 0.3)",
                }}
              >
                <Heading as="h2" style={{ fontSize: "1.75rem" }}>
                  Details
                </Heading>
              </Box>

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

export const ProtocolImage = styled(Image)`
  height: 48px;
  width: 48px;
  margin-right: 16px;
  clip-path: circle(24px at center);
`;

export default RomulusIndexPage;
