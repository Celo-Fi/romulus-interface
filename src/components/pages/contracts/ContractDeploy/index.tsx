import styled from "@emotion/styled";
import { ethers } from "ethers";
import React, { useState } from "react";
import { Heading, Text } from "theme-ui";

import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { Address } from "../../../common/Address";
import { ContractBuilder } from "../../../common/ContractBuilder";

export const ContractDeploy: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const [contractAddress, setContractAddress] = useState<string>();

  return (
    <Wrapper>
      <Heading as="h1">Contract deploy</Heading>
      {contractAddress && (
        <Text>
          Deployed address: <Address value={contractAddress} />
        </Text>
      )}
      <div>
        <ContractBuilder
          onSubmit={async ({ abi, bytecode, args }) => {
            const signer = await getConnectedSigner();
            const contract = new ethers.ContractFactory(abi, bytecode, signer);
            const deployedContract = await contract.deploy(...args);
            setContractAddress(deployedContract.address);
            await deployedContract.deployed();
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
