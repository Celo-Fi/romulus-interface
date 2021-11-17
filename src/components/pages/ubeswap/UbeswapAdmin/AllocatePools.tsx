import styled from "@emotion/styled";
import { ContractTransaction } from "ethers";
import { isAddress } from "ethers/lib/utils";
import React, { useState } from "react";
import { Button, Card, Flex, Heading, Spinner, Text } from "theme-ui";
import { MultiSig__factory } from "../../../../generated";

import { usePoolManager } from "../../../../hooks/usePoolManager";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { Address } from "../../../common/Address";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";

export const AllocatePools: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const { poolManager, poolInfo } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);

  const weightSumOnChain = Object.values(poolInfo).reduce(
    (acc, { weight }) => acc + weight,
    0
  );
  const updatePoolWeight = React.useCallback(
    async (stakingToken, weight) => {
      const owner = await poolManager.owner();
      const multisig = MultiSig__factory.connect(
        owner,
        await getConnectedSigner()
      );

      const data = poolManager.interface.encodeFunctionData("setWeight", [
        stakingToken,
        weight,
      ]);
      const tx = await multisig.submitTransaction(poolManager.address, 0, data);
      setTx(tx);
    },
    [getConnectedSigner, poolManager]
  );
  const addNewFarm = React.useCallback(async () => {
    const pool = prompt("Enter LP token address of new farm");
    if (!pool || !isAddress(pool)) {
      console.warn("Not an address");
      return;
    }

    const operator = await poolManager.operator();
    const multisig = MultiSig__factory.connect(
      operator,
      await getConnectedSigner()
    );

    const data = poolManager.interface.encodeFunctionData("setWeight", [
      pool,
      0,
    ]);
    const tx = await multisig.submitTransaction(poolManager.address, 0, data);
    setTx(tx);
  }, [getConnectedSigner, poolManager]);

  return (
    <Card p={4}>
      <Heading as="h2" pb={2}>
        Update Pool Weights
      </Heading>
      <TransactionHash value={tx} />

      {Object.values(poolInfo).length === 0 ? (
        <Spinner />
      ) : (
        <NextPoolWeights>
          <thead>
            <tr>
              <th>Pool Name</th>
              <th>LP token address</th>
              <th>Farm address</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(poolInfo)
              .sort((a, b) => a.stakingToken.localeCompare(b.stakingToken))
              .sort((a, b) => a.weight - b.weight)
              .map((info) => {
                return (
                  <tr key={info.stakingToken}>
                    <td>
                      <Address value={info.token0} label={info.token0Symbol} />-
                      <Address value={info.token1} label={info.token1Symbol} />
                    </td>
                    <td>
                      <Address value={info.stakingToken} truncate />
                    </td>
                    <td>
                      <Address value={info.poolAddress} truncate />
                    </td>
                    <td>
                      <Flex sx={{ alignItems: "center" }}>
                        <Text mr={1}>{info.weight}</Text>
                        <Button
                          onClick={() => {
                            const weight = prompt("Enter a new weight");
                            if (
                              weight === null ||
                              weight === "" ||
                              isNaN(Number(weight)) ||
                              Number(weight) < 0
                            ) {
                              console.warn("Invalid weight");
                              return;
                            }
                            updatePoolWeight(info.stakingToken, weight);
                          }}
                        >
                          change
                        </Button>
                      </Flex>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </NextPoolWeights>
      )}

      <Text sx={{ display: "block", textAlign: "right" }} my={2}>
        Total weight: {weightSumOnChain.toLocaleString()} / 10,000 ={" "}
        {weightSumOnChain / 10_000}
      </Text>

      <Button onClick={addNewFarm}>New Farm</Button>
    </Card>
  );
};

const NextPoolWeights = styled.table`
  width: 100%;
  th {
    text-align: left;
    border-bottom: 1px solid black;
  }
  td {
    border-bottom: 1px solid black;
  }
`;
