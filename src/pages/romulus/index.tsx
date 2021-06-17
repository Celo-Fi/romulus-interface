import { Box, Card, Heading, Table, Text } from "@dracula/dracula-ui";
import { useRouter } from "next/router";
import React from "react";

const governances = [
  {
    name: "Poof.cash",
    address: "0x125A2e7C1DBAC09740cA2D38d6972fBd6DA5ba69",
  },
];

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();

  return (
    <Box>
      <Box mb="md">
        <Heading>Romulus</Heading>
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
            }}
            onClick={() => void router.push(`/romulus/${governance.address}`)}
            width="xxs"
            height="xxs"
          >
            <Text size="lg">{governance.name}</Text>
          </Card>
        );
      })}
    </Box>
  );
};

export default RomulusIndexPage;
