import styled from "@emotion/styled";
import React from "react";
import { useTimelock } from "../../../hooks/useTimelock";
import { TransactionBuilder } from "../../common/TransactionBuilder";

interface Props {
  address: string;
}

export const TimelockIndex: React.FC<Props> = ({
  address: timelockAddress,
}) => {
  const timelock = useTimelock(timelockAddress);
  return (
    <Wrapper>
      <h1>Timelock {timelockAddress}</h1>
      <div>
        <h2>Add transaction</h2>
        <TransactionBuilder />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 100%;
  width: 720px;
  margin: 0 auto;
`;
