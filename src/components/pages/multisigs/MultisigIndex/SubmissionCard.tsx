import styled from "@emotion/styled";
import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

import { Submission } from ".";

interface Props {
  submission: Submission;
}

export const SubmissionCard: React.FC<Props> = ({ submission }: Props) => {
  return (
    <Wrapper>
      <Title>
        <ID>{submission.id}</ID>
        <a
          href={`https://alfajores-blockscout.celo-testnet.org/tx/${submission.submissionHash}`}
          target="_blank"
          rel="noreferrer"
        >
          <FaExternalLinkAlt />
        </a>
      </Title>
    </Wrapper>
  );
};

const ID = styled.span`
  font-weight: 600;
  color: blue;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  border: 1px solid #ccc;
  border-radius: 2px;
  padding: 16px;
`;
