import { Address } from "@celo/contractkit";
import { ChainId, useContractKit } from "@celo-tools/use-contractkit";
import { useRouter } from "next/router";
import React from "react";
import { Box, Flex, Heading, Image, Text } from "theme-ui";
import AppBody from "../AppBody";
import styled from "styled-components";
import { RomulusRow } from "../../components/Row";

export type Governance = {
  name: string;
  addresses: Record<ChainId, Address>;
  icon: string;
};

const governances: Governance[] = [
  {
    name: "Poof.cash",
    addresses: {
      [ChainId.Mainnet]: "0x1fDf21dac8424cfd8FDB5706824a62CE980fd8a2",
      [ChainId.Alfajores]: "0x125A2e7C1DBAC09740cA2D38d6972fBd6DA5ba69",
      [ChainId.Baklava]: "",
    },
    icon: "/assets/asset_POOF.png",
  },
  {
    name: "Ubeswap",
    addresses: {
      [ChainId.Mainnet]: "0xa7581d8E26007f4D2374507736327f5b46Dd6bA8",
      [ChainId.Alfajores]: "0xa7581d8E26007f4D2374507736327f5b46Dd6bA8",
      [ChainId.Baklava]: "0xa7581d8E26007f4D2374507736327f5b46Dd6bA8",
    },
    icon: "/assets/asset_UBE.png",
  },
  {
    name: "Moola",
    addresses: {
      [ChainId.Mainnet]: "0xde457ed1A713C290C4f8dE1dE0D0308Fc7722937",
      [ChainId.Alfajores]: "0x4Bb7b74d7E6B03862Dba0785E54E687C01ECffC8",
      [ChainId.Baklava]: "",
    },
    icon: "/assets/asset_MOO.png",
  },
];

export const governanceLookup = governances.reduce((acc, curr) => {
  Object.values(curr.addresses).forEach((address) => {
    acc[address] = curr;
  });
  return acc;
}, {} as Record<Address, Governance>);

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const { network } = useContractKit();

  return (
    <Box>
      <AppBody>
        <GovernanceHeader>
          <Heading as="h1" mb={2} style={{ fontSize: "1.5rem" }}>
            Governance
          </Heading>
          <Box mb={4}>
            <Text>Select a protocol to view</Text>
          </Box>
        </GovernanceHeader>
        <RomulusRow>
          {governances.map((governance, idx) => {
            return (
              <Flex
                key={idx}
                sx={{
                  textAlign: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bg: "highlight",
                  width: "fit-content",
                  p: 4,
                  mr: 4,
                  mb: 2,
                  borderRadius: 12,
                }}
                onClick={() =>
                  void router.push(
                    `/romulus/${governance.addresses[network.chainId] ?? ""}`
                  )
                }
              >
                <Image
                  sx={{
                    height: "48px",
                    width: "48px",
                    mr: 2,
                    clipPath: "circle(24px at center)",
                  }}
                  src={governance.icon}
                />
                <Heading as="h2">{governance.name}</Heading>
              </Flex>
            );
          })}
        </RomulusRow>
      </AppBody>
    </Box>
  );
};

const GovernanceHeader = styled(Box)`
  justify-content: space-between;
  padding: 45px 45px 25px 45px;
`;

export default RomulusIndexPage;
