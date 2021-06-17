import { Box, Text } from "@dracula/dracula-ui";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";
import Modal from "react-modal";

const IndexPage: React.FC = () => {
  Modal.setAppElement("#body");
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
