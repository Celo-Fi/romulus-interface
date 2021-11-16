import { useProvider } from "@celo-tools/use-contractkit";
import styled from "@emotion/styled";
import React from "react";
import { Heading } from "theme-ui";

import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { TransactionBuilder } from "../../../common/TransactionBuilder";

export const ContractCall: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const provider = useProvider();

  return (
    <Wrapper>
      <Heading as="h1">Contract call</Heading>
      <div>
        <TransactionBuilder
          onSubmit={async ({ call, data, read, decodeFunctionResult }) => {
            if (read) {
              alert(
                decodeFunctionResult(
                  await provider.call({
                    to: call.target,
                    value: call.value,
                    data,
                  })
                ).toString()
              );
            } else {
              const signer = await getConnectedSigner();
              const tx = await signer.sendTransaction({
                to: call.target,
                value: call.value,
                data,
              });
              console.log("Submit TX", tx);
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
