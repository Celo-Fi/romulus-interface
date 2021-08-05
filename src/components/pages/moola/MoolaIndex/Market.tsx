import { useContractKit } from "@celo-tools/use-contractkit";
import { css } from "@emotion/react";
import { ChainId } from "@ubeswap/sdk";
import { BigNumber } from "ethers";
import {
  commify,
  formatEther,
  formatUnits,
  parseEther,
} from "ethers/lib/utils";
import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Link, Switch, Text } from "theme-ui";

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

const describeBorrowMode = (mode: BigNumber): React.ReactNode => {
  switch (mode.toString()) {
    case "0":
      return <Text color="blackSecondary">n/a</Text>;
    case "1":
      return <Text color="green">fixed</Text>;
    case "2":
      return <Text color="yellow">variable</Text>;
  }
  return "";
};

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
    userBalance: BigNumber | null;
  } | null>(null);
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
          userBalance:
            address !== null ? await provider.getBalance(address) : null,
        });
      } else {
        const tokenRaw = ERC20__factory.connect(reserve, provider);
        setToken({
          name: await tokenRaw.name(),
          symbol: await tokenRaw.symbol(),
          userBalance:
            address !== null ? await tokenRaw.balanceOf(address) : null,
        });
      }
      setPrice(await priceOracle.getAssetPrice(reserve));
      setConfig(await lendingPool.getReserveConfigurationData(reserve));
      setData(await lendingPool.getReserveData(reserve));
      if (address !== null) {
        setUserData(await lendingPool.getUserReserveData(reserve, address));
      }
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
        {token ? (
          <Box>
            {token.name} ({token.symbol})
          </Box>
        ) : (
          <p>Loading {reserve}...</p>
        )}
      </td>
      <td>
        {token && data && (
          <ul>
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
          </ul>
        )}
      </td>
      <td>
        <Box>
          {address === "" && (
            <Link color="blackSecondary" href="#" onClick={getConnectedSigner}>
              Connect your wallet
            </Link>
          )}
          {userData && token && (
            <ul>
              {token.userBalance && (
                <li>
                  Wallet: {formatEther(token.userBalance)} {token.symbol}
                </li>
              )}
              <li>
                Supply:{" "}
                <Text color="green">
                  {formatEther(userData.currentATokenBalance)}
                </Text>{" "}
                <Text color="cyan">Moola {token.symbol}</Text>
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
              <li>
                Borrow Mode: {describeBorrowMode(userData.borrowRateMode)}
              </li>
              <li>
                Borrow Rate:{" "}
                <Text color="green">
                  {parseFloat(formatUnits(userData.borrowRate, 25)).toFixed(4)}%
                </Text>
              </li>
              <li>
                Remaining Borrow Limit:{" "}
                {borrowLimit
                  ? `${commify(formatEther(borrowLimit))} ${token.symbol}`
                  : "--"}
              </li>
              <li>
                Origination Fee: {commify(formatEther(userData.originationFee))}{" "}
                {token.symbol}
              </li>
            </ul>
          )}
        </Box>
      </td>
      <td>
        <Switch
          color="purple"
          disabled={
            !userData || userData.currentATokenBalance.isZero() === true
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          checked={userData?.usageAsCollateralEnabled === true}
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
            display: flex;
            gap: var(--spacing-sm);
          `}
        >
          <Button
            mr={2}
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
            mr={2}
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
            mr={2}
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
                  await runTx(
                    lendingPool,
                    "deposit",
                    [reserve, rawAmount, 0x4999],
                    {
                      value: rawAmount,
                    }
                  );
                } else {
                  alert(`Approving ${formatEther(rawAmount)}`);
                  await runTx(
                    ERC20__factory.connect(reserve, signer),
                    "approve",
                    [
                      moolaLendingPools[ChainId.MAINNET].lendingPoolCore,
                      rawAmount,
                    ]
                  );
                  alert(`Depositing ${formatEther(rawAmount)}`);
                  await runTx(lendingPool, "deposit", [
                    reserve,
                    rawAmount,
                    0x4999,
                  ]);
                }
                await refreshData();
              }
            }}
          >
            Deposit
          </Button>
          <Button
            mr={2}
            onClick={async () => {
              const signer = await getConnectedSigner();
              const lendingPool = LendingPool__factory.connect(
                moolaLendingPools[ChainId.MAINNET].lendingPool,
                signer
              );
              const amount = prompt("How much do you want to repay?");
              if (amount && address) {
                const rawAmount = parseEther(amount);
                alert(`Approving ${formatEther(rawAmount)}`);
                await runTx(
                  ERC20__factory.connect(reserve, signer),
                  "approve",
                  [
                    moolaLendingPools[ChainId.MAINNET].lendingPoolCore,
                    rawAmount,
                  ]
                );
                alert(`Repaying ${formatEther(rawAmount)}`);
                await runTx(lendingPool, "repay", [
                  reserve,
                  rawAmount,
                  address,
                ]);
                await refreshData();
              }
            }}
          >
            Repay
          </Button>
        </Box>
      </td>
    </tr>
  );
};
