import styled from "@emotion/styled";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button, Heading, Text } from "theme-ui";

const IndexPage: React.FC = () => {
  const router = useRouter();
  return (
    <Wrapper>
      <Text variant="logo" sx={{ fontSize: [6, 7] }}>
        Romulus
      </Text>
      <Box mt={2} mb={5}>
        <Heading as="h3">A government management system</Heading>
      </Box>
      <Button color="yellowPink" onClick={() => router.push("/romulus")}>
        Start Voting
      </Button>
    </Wrapper>
  );
};

const Wrapper = styled(Box)`
  padding: 150px 0;
  text-align: center;
  h1 {
    font-family: Cinzel;
    font-size: 84px;
  }
`;

export default IndexPage;
