import styled from "@emotion/styled";
import React from "react";
import { Heading } from "theme-ui";

import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { TransactionBuilder } from "../../../common/TransactionBuilder";

export const ContractCall: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();

  return (
    <Wrapper>
      <Heading as="h1">Contract call</Heading>
      <div>
        <TransactionBuilder
          onSubmit={async ({ call, data, read, decodeFunctionResult }) => {
            const signer = await getConnectedSigner();
            if (read) {
              alert(
                decodeFunctionResult(
                  await signer.call({
                    to: call.target,
                    value: call.value,
                    data,
                  })
                ).toString()
              );
            } else {
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
