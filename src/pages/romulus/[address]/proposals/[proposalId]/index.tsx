import { useRouter } from "next/dist/client/router";
import React, { useEffect, useState } from "react";
import { Box, Heading, Text } from "theme-ui";
import { ProposalCard } from "../../../../../components/pages/romulus/ProposalCard";
import { useProposals } from "../../../../../hooks/romulus/useProposals";
import { governanceLookup } from "../../..";
import styled from "styled-components";
import AppBody from "../../../../AppBody";
import { TopSection, AutoColumn } from "../../../../../components/Column";
import { RowBetween } from "../../../../../components/Row";
import { DetailedProposalCard } from "../../../../../components/pages/romulus/DetailedProposalCard";
import Loader from "../../../../../components/Loader";

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
      <AppBody>
        {proposal ? (
          <>
            <Box
              mb={4}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "45px 45px 25px 45px",
              }}
            >
              {proposal && (
                <Heading as="h2" style={{ fontSize: "1.75rem" }}>
                  Proposal 00{proposal.args.id.toString()}
                </Heading>
              )}
            </Box>
            <Box pb={6} style={{ paddingBottom: "15px" }}>
              {proposal && (
                <Box
                  mt={3}
                  style={{ margin: "32px" }}
                  onClick={() => {
                    console.log(router.query);
                  }}
                >
                  <DetailedProposalCard proposalEvent={proposal} />
                </Box>
              )}
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
    </>
  );
};

export default RomulusIndexPage;
