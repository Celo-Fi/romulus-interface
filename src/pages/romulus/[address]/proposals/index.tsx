import { useRouter } from "next/dist/client/router";
import React from "react";
import { Box, Heading, Text } from "theme-ui";
import { ProposalCard } from "../../../../components/pages/romulus/ProposalCard";
import { useProposals } from "../../../../hooks/romulus/useProposals";
import { governanceLookup } from "../..";
import styled from "styled-components";
import AppBody from "../../../AppBody";
import { TopSection, AutoColumn } from "../../../../components/Column";
import { RowBetween } from "../../../../components/Row";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;
  const governanceDescription = romulusAddress
    ? governanceLookup[romulusAddress.toString()]
    : undefined;
  const [proposals] = useProposals((romulusAddress as string) || "");

  return (
    <>
      <Box>
        <TopSection gap="md">
          <DataCard>
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <Text sx={{ fontWeight: 600 }}>
                    {governanceDescription ? governanceDescription.name : ""}{" "}
                    Governance Overview
                  </Text>
                </RowBetween>
                <RowBetween>
                  <Text sx={{ fontSize: 14 }}>
                    View proposals, delegate votes, and participate in Ubeswap
                    governance!{" "}
                  </Text>
                </RowBetween>{" "}
              </AutoColumn>
            </CardSection>
          </DataCard>
        </TopSection>
        <AppBody>
          <Box
            mb={4}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "45px",
            }}
          >
            <Heading as="h2">Proposals</Heading>
          </Box>
          <Box pb={6} style={{ paddingBottom: "15px" }}>
            {proposals.length > 1 &&
              proposals
                .slice(1)
                .reverse()
                .map((proposalEvent, idx) => (
                  <Box key={idx} mt={3} style={{ margin: "32px" }}>
                    <ProposalCard proposalEvent={proposalEvent} />
                  </Box>
                ))}
          </Box>
        </AppBody>
      </Box>
    </>
  );
};

export const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  background: radial-gradient(
    96.02% 99.41% at 1.84% 0%,
    ${(props) => props.theme.primary1} 30%,
    ${(props) => props.theme.bg5} 100%
  );
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

export const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 1rem;
  z-index: 1;
  opacity: ${({ disabled }) => disabled && "0.4"};
`;

export default RomulusIndexPage;
