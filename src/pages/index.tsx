import { Box, Button, Text } from "@dracula/dracula-ui";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import React from "react";

const IndexPage: React.FC = () => {
  const router = useRouter();
  return (
    <Wrapper>
      <h1>Romulus</h1>
      <Box my="sm">
        <Text
          css={css`
            font-size: var(--font-3xl);
          `}
        >
          A{" "}
          <Text
            css={css`
              font-size: var(--font-3xl);
            `}
            color="purpleCyan"
          >
            government management system
          </Text>
        </Text>
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
