import { useContractKit } from "@celo-tools/use-contractkit";
import { Box, Button, List, Text } from "@dracula/dracula-ui";
import styled from "@emotion/styled";
import { ChainId } from "@ubeswap/sdk";
import { BigNumber } from "ethers";
import { formatEther, formatUnits, parseEther } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";

import { AToken__factory, LendingPool__factory } from "../../../../generated";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../../hooks/useProviderOrSigner";
import { CELO_MOOLA, moolaLendingPools } from ".";

interface IProps {
  reserve: string;
}

interface IReserveData {
  totalLiquidity: BigNumber;
  availableLiquidity: BigNumber;
  totalBorrowsStable: BigNumber;
  totalBorrowsVariable: BigNumber;
  liquidityRate: BigNumber;
  variableBorrowRate: BigNumber;
  stableBorrowRate: BigNumber;
  averageStableBorrowRate: BigNumber;
  utilizationRate: BigNumber;
  liquidityIndex: BigNumber;
  variableBorrowIndex: BigNumber;
  aTokenAddress: string;
  lastUpdateTimestamp: number;
}

interface IReserveConfigurationData {
  ltv: BigNumber;
  liquidationThreshold: BigNumber;
  liquidationBonus: BigNumber;
  interestRateStrategyAddress: string;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  isActive: boolean;
}

interface IUserReserveData {
  currentATokenBalance: BigNumber;
  currentBorrowBalance: BigNumber;
  principalBorrowBalance: BigNumber;
  borrowRateMode: BigNumber;
  borrowRate: BigNumber;
  liquidityRate: BigNumber;
  originationFee: BigNumber;
  variableBorrowIndex: BigNumber;
  lastUpdateTimestamp: BigNumber;
  usageAsCollateralEnabled: boolean;
}

export const Market: React.FC<IProps> = ({ reserve }: IProps) => {
  const { address } = useContractKit();
  const provider = useProvider();
  const getConnectedSigner = useGetConnectedSigner();
  const [data, setData] = useState<IReserveData | null>(null);
  const [config, setConfig] = useState<IReserveConfigurationData | null>(null);
  const [userData, setUserData] = useState<IUserReserveData | null>(null);
  const [token, setToken] = useState<{ name: string; symbol: string } | null>(
    null
  );

  useEffect(() => {
    const lendingPool = LendingPool__factory.connect(
      moolaLendingPools[ChainId.MAINNET].lendingPool,
      provider
    );
    void (async () => {
      try {
        if (reserve === CELO_MOOLA) {
          setToken({
            name: "Celo",
            symbol: "CELO",
          });
        } else {
          const tokenRaw = AToken__factory.connect(reserve, provider);
          setToken({
            name: await tokenRaw.name(),
            symbol: await tokenRaw.symbol(),
          });
        }
        setConfig(await lendingPool.getReserveConfigurationData(reserve));
        setData(await lendingPool.getReserveData(reserve));
        setUserData(await lendingPool.getUserReserveData(reserve, address));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [provider, reserve, address]);

  if (!data || !config || !token) {
    return <Text>Loading...</Text>;
  }

  return (
    <Wrapper>
      <Box>
        {token.name} ({token.symbol})
      </Box>
      <Box>
        <List>
          <li>
            Liquidity: {formatEther(data.totalLiquidity)} {token.symbol}
          </li>
          <li>
            Borrows: {formatEther(data.totalBorrowsVariable)} {token.symbol}
          </li>
          <li>
            Borrow rate:{" "}
            {parseFloat(formatUnits(data.variableBorrowRate, 27)).toFixed(4)}%{" "}
            {token.symbol}
          </li>
        </List>
      </Box>
      <Box>{data?.lastUpdateTimestamp?.toString()}</Box>
      <Box>
        <Button>Use as Collateral</Button>
        <Button
          onClick={async () => {
            const signer = await getConnectedSigner();
            const lendingPool = LendingPool__factory.connect(
              moolaLendingPools[ChainId.MAINNET].lendingPool,
              signer
            );
            const amount = prompt("How much do you want to borrow?");
            if (amount) {
              alert(`Borrowing ${formatEther(parseEther(amount))}`);
              await lendingPool.borrow(reserve, parseEther(amount), 2, 0x4999);
            }
          }}
        >
          Borrow
        </Button>
        <Button>Repay</Button>
      </Box>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
`;
