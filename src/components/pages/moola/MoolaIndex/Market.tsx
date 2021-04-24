import { useContractKit } from "@celo-tools/use-contractkit";
import { Box, Button, List, Switch, Text } from "@dracula/dracula-ui";
import { css } from "@emotion/react";
import { ChainId } from "@ubeswap/sdk";
import { BigNumber, ContractTransaction } from "ethers";
import {
  commify,
  formatEther,
  formatUnits,
  parseEther,
} from "ethers/lib/utils";
import React, { useCallback, useEffect, useState } from "react";

import {
  ERC20__factory,
  IPriceOracle__factory,
  LendingPool__factory,
} from "../../../../generated";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../../hooks/useProviderOrSigner";
import { runTx } from "../../../../util/runTx";
import { CELO_MOOLA, IMoolaAccountData, moolaLendingPools } from ".";

interface IProps {
  accountData: IMoolaAccountData | null;
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

export const Market: React.FC<IProps> = ({ reserve, accountData }: IProps) => {
  const { address } = useContractKit();
  const provider = useProvider();
  const getConnectedSigner = useGetConnectedSigner();
  const [data, setData] = useState<IReserveData | null>(null);
  const [config, setConfig] = useState<IReserveConfigurationData | null>(null);
  const [userData, setUserData] = useState<IUserReserveData | null>(null);
  const [token, setToken] = useState<{
    name: string;
    symbol: string;
    userBalance: BigNumber;
  } | null>(null);
  const [tx, setTx] = useState<ContractTransaction | null>(null);
  const [price, setPrice] = useState<BigNumber | null>(null);

  const refreshData = useCallback(async () => {
    const priceOracle = IPriceOracle__factory.connect(
      moolaLendingPools[ChainId.MAINNET].priceOracle,
      provider
    );
    const lendingPool = LendingPool__factory.connect(
      moolaLendingPools[ChainId.MAINNET].lendingPool,
      provider
    );
    try {
      if (reserve === CELO_MOOLA) {
        setToken({
          name: "Celo",
          symbol: "CELO",
          userBalance: await provider.getBalance(address),
        });
      } else {
        const tokenRaw = ERC20__factory.connect(reserve, provider);
        setToken({
          name: await tokenRaw.name(),
          symbol: await tokenRaw.symbol(),
          userBalance: await tokenRaw.balanceOf(address),
        });
      }
      setPrice(await priceOracle.getAssetPrice(reserve));
      setConfig(await lendingPool.getReserveConfigurationData(reserve));
      setData(await lendingPool.getReserveData(reserve));
      setUserData(await lendingPool.getUserReserveData(reserve, address));
    } catch (e) {
      console.error(e);
    }
  }, [provider, reserve, address]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshData();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  if (!data || !config || !token) {
    return <Text>Loading...</Text>;
  }

  const borrowLimit = price
    ? accountData?.availableBorrowsETH
        .mul(BigNumber.from(10).pow(18))
        .div(price)
    : null;

  return (
    <tr
      className="drac-text"
      css={css`
        td {
          padding: var(--spacing-sm);
        }
        ul {
          padding-inline-start: 0px;
        }
      `}
    >
      <td>
        <Box>
          {token.name} ({token.symbol})
        </Box>
      </td>
      <td>
        <List variant="unordered" color="purple">
          <li>
            Liquidity: {commify(formatEther(data.totalLiquidity))}{" "}
            {token.symbol}
          </li>
          <li>
            Borrows: {commify(formatEther(data.totalBorrowsVariable))}{" "}
            {token.symbol}
          </li>
          <li>
            Borrows (fixed): {commify(formatEther(data.totalBorrowsStable))}{" "}
            {token.symbol}
          </li>
          <li>
            Supply interest rate:{" "}
            {parseFloat(formatUnits(data.liquidityRate, 25)).toFixed(4)}%
          </li>
          <li>
            Borrow interest rate:{" "}
            {parseFloat(formatUnits(data.variableBorrowRate, 25)).toFixed(4)}%
          </li>
          <li>
            Borrow interest rate (fixed):{" "}
            {parseFloat(formatUnits(data.stableBorrowRate, 25)).toFixed(4)}%
          </li>
          <li>
            Oracle Price: {price ? commify(formatEther(price)) : "--"} CELO
          </li>
        </List>
      </td>
      <td>
        <Box>
          {userData ? (
            <List variant="unordered" color="purple">
              <li>
                Wallet: {formatEther(token.userBalance)} {token.symbol}
              </li>
              <li>
                Supply: {formatEther(userData.currentATokenBalance)} Moola{" "}
                {token.symbol}
              </li>
              <li>
                Principal:{" "}
                {commify(formatEther(userData.principalBorrowBalance))}{" "}
                {token.symbol}
              </li>
              <li>
                Debt: {commify(formatEther(userData.currentBorrowBalance))}{" "}
                {token.symbol}
              </li>
              <li>Borrow Mode: {userData.borrowRateMode.toString()}</li>
              <li>
                Borrow Limit:{" "}
                {borrowLimit
                  ? `${commify(formatEther(borrowLimit))} ${token.symbol}`
                  : "--"}
              </li>
              <li>
                Origination Fee: {commify(formatEther(userData.originationFee))}{" "}
                {token.symbol}
              </li>
            </List>
          ) : (
            <>--</>
          )}
        </Box>
      </td>
      <td>
        <Switch
          key={address}
          color="purple"
          disabled={
            !userData || userData.currentATokenBalance.isZero() === true
          }
          defaultChecked={userData?.usageAsCollateralEnabled === true}
          onClick={async () => {
            const signer = await getConnectedSigner();
            const lendingPool = LendingPool__factory.connect(
              moolaLendingPools[ChainId.MAINNET].lendingPool,
              signer
            );
            await runTx(lendingPool, "setUserUseReserveAsCollateral", [
              reserve,
              userData?.usageAsCollateralEnabled !== true,
            ]);
            await refreshData();
          }}
        />
      </td>
      <td>
        <Box
          css={css`
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-gap: var(--spacing-sm);
          `}
        >
          <Button
            onClick={async () => {
              const signer = await getConnectedSigner();
              const lendingPool = LendingPool__factory.connect(
                moolaLendingPools[ChainId.MAINNET].lendingPool,
                signer
              );
              const amount = prompt("How much do you want to borrow (fixed)?");
              if (amount) {
                alert(`Borrowing (fixed) ${formatEther(parseEther(amount))}`);
                await runTx(lendingPool, "borrow", [
                  reserve,
                  parseEther(amount),
                  1,
                  0x4999,
                ]);
              }
              await refreshData();
            }}
          >
            Borrow (fixed)
          </Button>
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
                await runTx(lendingPool, "borrow", [
                  reserve,
                  parseEther(amount),
                  2,
                  0x4999,
                ]);
              }
              await refreshData();
            }}
          >
            Borrow
          </Button>
          <Button
            onClick={async () => {
              const signer = await getConnectedSigner();
              const lendingPool = LendingPool__factory.connect(
                moolaLendingPools[ChainId.MAINNET].lendingPool,
                signer
              );
              const amount = prompt("How much do you want to deposit?");
              if (amount) {
                const rawAmount = parseEther(amount);
                if (reserve === CELO_MOOLA) {
                  alert(`Depositing ${formatEther(rawAmount)}`);
                  const estimatedGas = await lendingPool.estimateGas.deposit(
                    reserve,
                    rawAmount,
                    0x4999,
                    {
                      value: rawAmount,
                    }
                  );
                  setTx(
                    await lendingPool.deposit(reserve, rawAmount, 0x4999, {
                      value: rawAmount,
                      gasLimit: estimatedGas.mul(110).div(100),
                    })
                  );
                } else {
                  alert(`Approving ${formatEther(rawAmount)}`);
                  setTx(
                    await ERC20__factory.connect(reserve, signer).approve(
                      moolaLendingPools[ChainId.MAINNET].lendingPoolCore,
                      rawAmount
                    )
                  );
                  alert(`Depositing ${formatEther(rawAmount)}`);
                  setTx(await lendingPool.deposit(reserve, rawAmount, 0x4999));
                }
                await refreshData();
              }
            }}
          >
            Deposit
          </Button>
          <Button>Repay</Button>
        </Box>
      </td>
    </tr>
  );
};
