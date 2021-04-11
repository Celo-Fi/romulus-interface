import styled from "@emotion/styled";
import React from "react";

import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { useTimelock } from "../../../../hooks/useTimelock";
import { TransactionBuilder } from "../../../common/TransactionBuilder";

interface Props {
  address: string;
}

export const TimelockQueueTransaction: React.FC<Props> = ({
  address: timelockAddress,
}: Props) => {
  const timelock = useTimelock(timelockAddress);
  const getConnectedSigner = useGetConnectedSigner();
  return (
    <Wrapper>
      <h1>Timelock {timelockAddress}</h1>
      <div>
        <h2>Add transaction</h2>
        <TransactionBuilder
          hasEta
          onSubmit={async ({ call, data }) => {
            const signer = await getConnectedSigner();
            const tx = await timelock
              .connect(signer)
              .queueTransaction(
                call.target,
                call.value,
                call.signature,
                data,
                call.eta
              );
            console.log("Queued", tx);
          }}
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 100%;
  width: 720px;
  margin: 0 auto;
`;
