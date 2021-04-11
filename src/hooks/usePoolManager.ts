import { Alfajores, useContractKit } from "@celo-tools/use-contractkit";
import { Web3Provider } from "@ethersproject/providers";
import { useEffect, useState } from "react";

import { PoolManager, PoolManager__factory } from "../generated";

const POOL_MANAGER_ADDRESS = "0x2bfd4e4db508024fb7e6443c008d54eb3579435f";

interface PoolInfo {
  index: number;
  stakingToken: string;
  poolAddress: string;
  weight: number;
  nextPeriod: number;
}

export const usePoolManager = (): {
  poolManager: PoolManager;
  poolAddresses: readonly string[];
  poolInfo: Record<string, PoolInfo>;
  operator: string;
  owner: string;
} => {
  const { kit, network, updateNetwork, address } = useContractKit();
  useEffect(() => {
    updateNetwork(Alfajores);
  }, []);
  const provider = new Web3Provider(kit.web3.currentProvider as unknown);
  const poolManager = PoolManager__factory.connect(
    POOL_MANAGER_ADDRESS,
    address ? provider.getSigner(address) : provider
  );

  const [poolAddresses, setPoolAddresses] = useState<readonly string[]>([]);
  const [operator, setOperator] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [poolInfo, setPoolInfo] = useState<Record<string, PoolInfo>>({});

  useEffect(() => {
    void (async () => {
      const count = await poolManager.poolsCount();
      const inputs = await Promise.all(
        Array(count.toNumber()).map((_, i) => poolManager.poolsByIndex(i))
      );
      setPoolAddresses(inputs);

      const pools = await Promise.all(
        inputs.map((input) => poolManager.pools(input))
      );

      const poolInfo: Record<string, PoolInfo> = {};
      pools.forEach(
        (p) =>
          (poolInfo[p.poolAddress] = {
            index: p.index.toNumber(),
            stakingToken: p.stakingToken,
            poolAddress: p.poolAddress,
            weight: p.weight.toNumber(),
            nextPeriod: p.nextPeriod.toNumber(),
          })
      );
      setPoolInfo(poolInfo);

      setOperator(await poolManager.operator());
      setOwner(await poolManager.owner());
    })();
  }, [network, poolManager]);
  return { poolManager, poolAddresses, poolInfo, operator, owner };
};
