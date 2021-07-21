import { Address } from "@celo/contractkit";
import { useRouter } from "next/router";
import React from "react";
import { Box, Flex, Heading, Image, Text } from "theme-ui";

type Governance = {
  name: string;
  address: Address;
  icon: string;
};

const governances: Governance[] = [
  {
    name: "Poof.cash",
    // TODO: undo
    address: "0x125A2e7C1DBAC09740cA2D38d6972fBd6DA5ba69",
    icon: "/assets/asset_POOF.png",
  },
  {
    name: "Ubeswap",
    address: "0xa54555d9c13294326452fd8dEaC4bF9334c7BaCb",
    icon: "/assets/asset_UBE.png",
  },
];

export const governanceLookup: Record<Address, string> = governances.reduce(
  (acc, curr) => ({ ...acc, [curr.address]: curr.name }),
  {}
);

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();

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
              onClick={() => void router.push(`/romulus/${governance.address}`)}
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
