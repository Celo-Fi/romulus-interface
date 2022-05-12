import { useRouter } from "next/router";
import React from "react";
import { Box, Flex, Heading, Image, Text } from "theme-ui";
import { useWeb3Context } from "web3-react";

type Governance = {
  name: string;
  addresses: Record<ChainId, string>;
  icon: string;
};

export declare enum ChainId {
  MAINNET = 137,
  MUMBAI = 80001,
}

const governances: Governance[] = [
  {
    name: "Poof.cash",
    addresses: {
      [ChainId.MAINNET]: "",
      [ChainId.MUMBAI]: "0x125A2e7C1DBAC09740cA2D38d6972fBd6DA5ba69",
    },
    icon: "/assets/asset_POOF.png",
  },
];

export const governanceLookup = governances.reduce((acc, curr) => {
  Object.values(curr.addresses).forEach((address) => {
    acc[address] = curr.name;
  });
  return acc;
}, {} as Record<string, string>);

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const { networkId } = useWeb3Context();

  return (
    <Box>
      <Heading as="h1" mb={2}>
        Governance
      </Heading>
      <Box mb={4}>
        <Text>Select a governance system</Text>
      </Box>
      <Flex sx={{ flexWrap: "wrap", mt: 2 }}>
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
                borderRadius: 4,
              }}
              onClick={() =>
                void router.push(
                  `/romulus/${governance.addresses[networkId!] ?? ""}`
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
      </Flex>
    </Box>
  );
};

export default RomulusIndexPage;
