import { useProvider } from "@celo-tools/use-contractkit";
import styled from "@emotion/styled";
import React from "react";
import { MultiSig__factory } from "../../../../generated";

import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { useTimelock } from "../../../../hooks/useTimelock";
import { TransactionBuilder } from "../../../common/TransactionBuilder";

interface Props {
  address: string;
}

export const TimelockQueueTransaction: React.FC<Props> = ({
  address: timelockAddress,
}: Props) => {
  const { timelock } = useTimelock(timelockAddress);
  const getConnectedSigner = useGetConnectedSigner();
  const provider = useProvider();
  return (
    <Wrapper>
      <h1>Timelock {timelockAddress}</h1>
      <div>
        <h2>Add transaction</h2>
        <TransactionBuilder
          hasEta
          onSubmit={async ({ call, data }) => {
            const signer = await getConnectedSigner();
            const connectedTimelock = timelock.connect(signer);
            const admin = await timelock.admin();
            const adminCode = await provider.getCode(admin);
            if (adminCode === "0x") {
              const tx = await connectedTimelock.queueTransaction(
                call.target,
                call.value,
                "",
                data,
                call.eta
              );
              console.log("Queued", tx);
            } else {
              // Assume multisig
              const multisig = MultiSig__factory.connect(admin, signer);
              const tx = await multisig.submitTransaction(
                timelockAddress,
                0,
                timelock.interface.encodeFunctionData("queueTransaction", [
                  call.target,
                  call.value,
                  "",
                  data,
                  call.eta,
                ])
              );
              console.log("Queued", tx);
            }
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
