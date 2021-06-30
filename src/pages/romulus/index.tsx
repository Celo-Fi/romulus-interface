import { Address } from "@celo/contractkit";
import { Box, Card, Heading, Text } from "@dracula/dracula-ui";
import { useRouter } from "next/router";
import React from "react";

type Governance = {
  name: string;
  address: Address;
};

const governances: Governance[] = [
  {
    name: "Poof.cash",
    address: "0x1fDf21dac8424cfd8FDB5706824a62CE980fd8a2",
  },
  {
    name: "Ubeswap",
    address: "0xa54555d9c13294326452fd8dEaC4bF9334c7BaCb",
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
      <Box mb="md">
        <Heading>Romulus</Heading>
        <Box mt="sm">
          <Text>Select a governance system</Text>
        </Box>
      </Box>
      <Box css={{ display: "flex", flexWrap: "wrap" }}>
        {governances.map((governance) => {
          return (
            <Card
              css={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() => void router.push(`/romulus/${governance.address}`)}
              height="xxs"
              mr="sm"
              p="md"
              width="md"
              color="pinkPurple"
            >
              <Heading size="xl">{governance.name}</Heading>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default RomulusIndexPage;
