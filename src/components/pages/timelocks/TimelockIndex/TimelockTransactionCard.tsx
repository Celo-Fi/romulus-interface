import styled from "@emotion/styled";
import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

import { FunctionCall } from "../../../common/FunctionCall";
import { TimelockTransaction } from ".";

interface Props {
  tx: TimelockTransaction;
}

export const TimelockTransactionCard: React.FC<Props> = ({ tx }: Props) => {
  return (
    <Wrapper>
      <Title>
        <ID>{tx.txHash}</ID>
        <a
          href={`https://alfajores-blockscout.celo-testnet.org/tx/${tx.queuedTxHash}`}
          target="_blank"
          rel="noreferrer"
        >
          <FaExternalLinkAlt />
        </a>
      </Title>
      <FunctionCall address={tx.target} data={tx.data} value={tx.value} />
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
