import { useRouter } from "next/dist/client/router";
import React from "react";
import { Box, Heading } from "theme-ui";
import { ProposalCard } from "../../../../components/pages/romulus/ProposalCard";
import { useProposals } from "../../../../hooks/romulus/useProposals";
import AppBody from "../../../AppBody";
import styled from "styled-components";
import Loader from "../../../../components/Loader";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;
  const [proposals] = useProposals((romulusAddress as string) || "");

  return (
    <>
      <Box
        style={{
          marginTop: "45px",
        }}
      >
        <AppBody>
          <ProposalHeader>
            <Heading as="h2" style={{ fontSize: "1.75rem" }}>
              Governance Proposals
            </Heading>
          </ProposalHeader>
          <Box pb={6} style={{ paddingBottom: "15px" }}>
            {proposals.length > 1 ? (
              proposals
                .slice(1)
                .reverse()
                .map((proposalEvent, idx) => (
                  <Box
                    key={idx}
                    mt={3}
                    style={{ margin: "32px" }}
                    onClick={() => {
                      router.push(
                        `${router.asPath}/${proposalEvent.args.id.toString()}`
                      );
                    }}
                  >
                    <ProposalCard
                      proposalEvent={proposalEvent}
                      clickable={true}
                    />
                  </Box>
                ))
            ) : (
              <>
                <Box
                  style={{
                    padding: "128px",
                  }}
                >
                  <Loader size="48px"></Loader>
                </Box>
              </>
            )}
          </Box>
        </AppBody>
      </Box>
    </>
  );
};

const ProposalHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  padding: 45px 45px 25px 45px;
  margin-bottom: 32px;
`;

export default RomulusIndexPage;
