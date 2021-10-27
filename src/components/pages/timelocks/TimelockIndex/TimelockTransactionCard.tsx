import styled from "@emotion/styled";
import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Button } from "theme-ui";

import { ITimelock } from "../../../../generated";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { FunctionCall } from "../../../common/FunctionCall";
import { TimelockTransaction } from ".";

interface Props {
  timelock: ITimelock;
  tx: TimelockTransaction;
}

export const TimelockTransactionCard: React.FC<Props> = ({
  tx,
  timelock,
}: Props) => {
  const getConnectedSigner = useGetConnectedSigner();
  return (
    <Wrapper>
      <Title>
        <ID>{tx.txHash}</ID>
        <a
          href={`https://explorer.celo.org/tx/${tx.queuedTxHash}`}
          target="_blank"
          rel="noreferrer"
        >
          <FaExternalLinkAlt />
        </a>
      </Title>
      <FunctionCall address={tx.target} data={tx.data} value={tx.value} />
      <p>{tx.signature}</p>
      <Button
        onClick={async () => {
          const signer = await getConnectedSigner();
          const result = await timelock
            .connect(signer)
            .executeTransaction(tx.target, tx.value, "", tx.data, tx.eta);
          console.log(result);
        }}
      >
        Execute
      </Button>
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
