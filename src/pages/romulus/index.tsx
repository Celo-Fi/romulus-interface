import { Box, Card, Heading, Table, Text } from "@dracula/dracula-ui";
import { useRouter } from "next/router";
import { Address } from "@celo/contractkit";
import React from "react";

type Governance = {
  name: string;
  address: Address;
};

const governances: Governance[] = [
  {
    name: "Poof.cash",
    address: "0x125A2e7C1DBAC09740cA2D38d6972fBd6DA5ba69",
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
      {governances.map((governance) => {
        return (
          <Card
            css={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              cursor: "pointer",
              width: "fit-content",
            }}
            onClick={() => void router.push(`/romulus/${governance.address}`)}
            height="xxs"
            p="md"
          >
            <Heading size="xl">{governance.name}</Heading>
          </Card>
        );
      })}
    </Box>
  );
};

export default RomulusIndexPage;
