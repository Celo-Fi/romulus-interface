import styled from "@emotion/styled";
import { ContractTransaction, ethers } from "ethers";
import { isAddress } from "ethers/lib/utils";
import React, { useState } from "react";
import { Button, Card, Flex, Heading, Spinner, Text } from "theme-ui";

import {
  ERC20__factory,
  FarmRegistry__factory,
  IUniswapV2Pair__factory,
  MoolaStakingRewards__factory,
  MultiSig__factory,
} from "../../../../generated";
import { usePoolManager } from "../../../../hooks/usePoolManager";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../../hooks/useProviderOrSigner";
import {
  FARM_REGISTRY_ADDRESS,
  useRegisteredFarms,
} from "../../../../hooks/useRegisteredFarms";
import { Address } from "../../../common/Address";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";

export const AllocatePools: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const provider = useProvider();
  const { poolManager, poolInfo } = usePoolManager();
  const [registeredFarms, refetch] = useRegisteredFarms();
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

    const owner = await poolManager.owner();
    const multisig = MultiSig__factory.connect(
      owner,
      await getConnectedSigner()
    );

    const data = poolManager.interface.encodeFunctionData("setWeight", [
      pool,
      0,
    ]);
    const tx = await multisig.submitTransaction(poolManager.address, 0, data);
    setTx(tx);
  }, [getConnectedSigner, poolManager]);

  const registerFarm = React.useCallback(
    async (farmName: string, farmAddress: string) => {
      const signer = await getConnectedSigner();
      console.log(signer._address);
      if (
        signer._address.toLowerCase() !==
        "0x9cb673b34a2ea86aad07f61471cb4f9458764b9f"
      ) {
        alert(
          "Please change your wallet address to 0x9Cb673B34A2eA86AAd07f61471cb4F9458764B9F"
        );
        return;
      }
      const farmRegistry = FarmRegistry__factory.connect(
        FARM_REGISTRY_ADDRESS,
        signer
      );
      const tx = await farmRegistry.addFarmInfo(
        ethers.utils.formatBytes32String(farmName),
        farmAddress
      );
      setTx(tx);
    },
    [getConnectedSigner]
  );

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
                          mr={1}
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
                            void updatePoolWeight(info.stakingToken, weight);
                          }}
                        >
                          change
                        </Button>
                        {!registeredFarms?.[info.poolAddress.toLowerCase()] && (
                          <Button
                            onClick={async () => {
                              await registerFarm(
                                `${info.token0Symbol}-${info.token1Symbol}`,
                                info.poolAddress
                              );
                              refetch();
                            }}
                          >
                            register
                          </Button>
                        )}
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

      <Button onClick={addNewFarm} mr={1}>
        New Farm
      </Button>
      <Button
        onClick={async () => {
          const farmAddress = prompt("Enter farm address");
          if (!farmAddress) {
            alert("Invalid farm address");
            return;
          }
          const farm = MoolaStakingRewards__factory.connect(
            farmAddress,
            provider
          );
          const lp = IUniswapV2Pair__factory.connect(
            await farm.stakingToken(),
            provider
          );
          const token0Symbol = await ERC20__factory.connect(
            await lp.token0(),
            provider
          ).symbol();
          const token1Symbol = await ERC20__factory.connect(
            await lp.token1(),
            provider
          ).symbol();
          await registerFarm(`${token0Symbol}-${token1Symbol}`, farmAddress);
        }}
      >
        Register Custom Farm
      </Button>
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
