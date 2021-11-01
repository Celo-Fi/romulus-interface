import styled from "@emotion/styled";
import { ContractTransaction } from "ethers";
import React, { useState } from "react";
import { Button, Card, Heading } from "theme-ui";
import Web3 from "web3";
import { AbiItem, fromWei } from "web3-utils";

import { usePoolManager } from "../../../hooks/usePoolManager";
import { useGetConnectedSigner } from "../../../hooks/useProviderOrSigner";
import { TransactionHash } from "../../../components/common/blockchain/TransactionHash";
import { POOL_WEIGHTS } from "../../../components/pages/ubeswap/UbeswapAdmin/config";
import ERC20Abi from "../../../abis/ERC20.json";
import { useAsyncState } from "../../../hooks/useAsyncState";
import { UbeMaker__factory } from "../../../generated";
import { IUniswapV2Pair__factory } from "../../../generated/factories/IUniswapV2Pair__factory";

const web3 = new Web3("https://forno.celo.org"); // TODO: HARDCODE
const UBE_MAKER = "0x9598143CaD531593ebEA31Cbf074106a92D3ccb0";

const UbeswapBuybackPage: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const { poolInfo } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);

  const buybackBalanceCall = React.useCallback(async () => {
    const lookup: Record<string, number> = {};
    await Promise.all(
      Object.values(poolInfo).map(async (pool) => {
        const contract = new web3.eth.Contract(
          ERC20Abi as AbiItem[],
          pool.stakingToken
        );
        const balance = await contract.methods.balanceOf(UBE_MAKER).call();
        lookup[pool.stakingToken] = Number(fromWei(balance));
      })
    );
    return lookup;
  }, [web3, poolInfo]);
  const [buybackBalanceLookup, refetch] = useAsyncState(
    null,
    buybackBalanceCall
  );

  const buyback = React.useCallback(async (lpTokenAddress: string) => {
    const signer = await getConnectedSigner();
    const lpToken = IUniswapV2Pair__factory.connect(lpTokenAddress, signer);
    const ubeMaker = UbeMaker__factory.connect(UBE_MAKER, signer);
    const tx = await ubeMaker.convert(
      await lpToken.token0(),
      await lpToken.token1()
    );
    setTx(tx);
    refetch();
  }, []);

  return (
    <Card p={4}>
      <Heading as="h2" pb={2}>
        Ubeswap Buyback Dashboard
      </Heading>
      <TransactionHash value={tx} />

      <NextPoolWeights>
        <thead>
          <tr>
            <th>idx</th>
            <th>Pool Name</th>
            <th>Current balance</th>
            <th>Buyback</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(poolInfo)
            .sort((a, b) => a.stakingToken.localeCompare(b.stakingToken))
            .sort((a, b) => a.weight - b.weight)
            .filter((info) => {
              return (
                POOL_WEIGHTS.find(
                  (w) =>
                    w.address.toLowerCase() === info.stakingToken.toLowerCase()
                ) !== undefined
              );
            })
            .map((info, idx) => {
              const name = POOL_WEIGHTS.find(
                (w) =>
                  w.address.toLowerCase() === info.stakingToken.toLowerCase()
              )?.name;
              return (
                <tr key={info.stakingToken}>
                  <td>{idx}</td>
                  <td>{name}</td>
                  <td>
                    {buybackBalanceLookup?.[info.stakingToken] ?? "-"} ULP
                  </td>
                  <td>
                    <Button
                      onClick={async () => {
                        buyback(info.stakingToken);
                      }}
                      disabled={
                        Number(
                          buybackBalanceLookup?.[info.stakingToken] ?? "0"
                        ) <= 0
                      }
                    >
                      Buyback UBE
                    </Button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </NextPoolWeights>
    </Card>
  );
};

const NextPoolWeights = styled.table`
  width: 100%;

  td {
    text-align: center;
  }
`;

export default UbeswapBuybackPage;
