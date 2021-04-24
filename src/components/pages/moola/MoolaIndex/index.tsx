import { useContractKit } from "@celo-tools/use-contractkit";
import { Card, Heading, Table, Text } from "@dracula/dracula-ui";
import styled from "@emotion/styled";
import { CELO, ChainId } from "@ubeswap/sdk";
import { BigNumber } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";

import { LendingPool__factory } from "../../../../generated";
import { useProvider } from "../../../../hooks/useProviderOrSigner";
import { Market } from "./Market";

export const CELO_MOOLA = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const addresses = {
  mcUSD: {
    [ChainId.ALFAJORES]: "0x71DB38719f9113A36e14F409bAD4F07B58b4730b",
    [ChainId.MAINNET]: "0x64dEFa3544c695db8c535D289d843a189aa26b98",
  },
  mcEUR: {
    [ChainId.ALFAJORES]: "0x32974C7335e649932b5766c5aE15595aFC269160",
    [ChainId.MAINNET]: "0xa8d0E6799FF3Fd19c6459bf02689aE09c4d78Ba7",
  },
  cEUR: {
    [ChainId.ALFAJORES]: "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F",
    [ChainId.MAINNET]: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
  },
  cUSD: {
    [ChainId.ALFAJORES]: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    [ChainId.MAINNET]: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  },
  CELO: {
    [ChainId.ALFAJORES]: CELO[ChainId.ALFAJORES].address,
    [ChainId.MAINNET]: CELO[ChainId.MAINNET].address,
  },
};

const RESERVES = [addresses.cUSD, addresses.cEUR];

export const moolaLendingPools = {
  // Addresses from: https://github.com/moolamarket/moola
  [ChainId.ALFAJORES]: {
    lendingPool: "0x0886f74eEEc443fBb6907fB5528B57C28E813129",
    lendingPoolCore: "0x090D652d1Bb0FEFbEe2531e9BBbb3604bE71f5de",
  },
  [ChainId.MAINNET]: {
    lendingPool: "0xc1548F5AA1D76CDcAB7385FA6B5cEA70f941e535",
    lendingPoolCore: "0xAF106F8D4756490E7069027315F4886cc94A8F73",
    // CeloProxyPriceProvider
    priceOracle: "0x3aAd7400b796523904528F2BDa8fbC27B1B7b621",
  },
};

export interface IMoolaAccountData {
  totalLiquidityETH: BigNumber;
  totalCollateralETH: BigNumber;
  totalBorrowsETH: BigNumber;
  totalFeesETH: BigNumber;
  availableBorrowsETH: BigNumber;
  currentLiquidationThreshold: BigNumber;
  ltv: BigNumber;
  healthFactor: BigNumber;
}

const interpretHealthFactor = (healthFactor: BigNumber): React.ReactNode => {
  const healthFactorF = parseFloat(formatEther(healthFactor));
  if (healthFactorF > 1.25 || healthFactor.isZero()) {
    return <Text color="green">OK</Text>;
  } else if (healthFactorF < 1) {
    return <Text color="red">Liquidation Imminent</Text>;
  } else {
    return <Text color="yellow">Risky</Text>;
  }
};

export const MoolaIndex: React.FC = () => {
  const { address } = useContractKit();
  const provider = useProvider();
  const [accountData, setAccountData] = useState<IMoolaAccountData | null>(
    null
  );

  useEffect(() => {
    if (!address) {
      return;
    }
    const lendingPool = LendingPool__factory.connect(
      moolaLendingPools[ChainId.MAINNET].lendingPool,
      provider
    );

    void (async () => {
      try {
        setAccountData(
          await lendingPool.callStatic.getUserAccountData(address)
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [address, provider]);

  return (
    <Wrapper className="drac-text">
      <Card p="md" variant="subtle" color="white">
        <Heading>Moola Market Bootleg Interface</Heading>
        <Text>This is an experimental interface. Use at your own risk.</Text>
      </Card>
      {address !== "" && (
        <Card p="md" variant="subtle" color="white">
          <Heading pb="sm">My Account</Heading>
          {accountData && (
            <Table color="cyan">
              <tr>
                <th>Total Liquidity CELO</th>
                <td>{formatEther(accountData.totalLiquidityETH)}</td>
              </tr>
              <tr>
                <th>Total Collateral CELO</th>
                <td>{formatEther(accountData.totalCollateralETH)}</td>
              </tr>
              <tr>
                <th>Total Borrows CELO</th>
                <td>{formatEther(accountData.totalBorrowsETH)}</td>
              </tr>
              <tr>
                <th>Total Fees CELO</th>
                <td>{formatEther(accountData.totalFeesETH)}</td>
              </tr>
              <tr>
                <th>Available Borrows CELO</th>
                <td>{formatEther(accountData.availableBorrowsETH)}</td>
              </tr>
              <tr>
                <th>Current Liquidiation Threshold</th>
                <td>{accountData.currentLiquidationThreshold.toString()}</td>
              </tr>
              <tr>
                <th>LTV</th>
                <td>{accountData.ltv.toString()}</td>
              </tr>
              <tr>
                <th>Health Factor</th>
                <td>
                  {parseFloat(
                    formatUnits(accountData.healthFactor, 18)
                  ).toFixed(4)}{" "}
                  {interpretHealthFactor(accountData.healthFactor)}
                </td>
              </tr>
            </Table>
          )}
        </Card>
      )}
      <Card p="md" variant="subtle" color="purple">
        <Heading pb="sm">Markets</Heading>
        <Table>
          <thead>
            <tr>
              <th>
                <Text weight="bold">Reserve Asset</Text>
              </th>
              <th>
                <Text weight="semibold">Market Info</Text>
              </th>
              <th>
                <Text weight="semibold">User Info</Text>
              </th>
              <th>
                <Text weight="semibold">Collateral Enabled?</Text>
              </th>
              <th>
                <Text weight="semibold">Actions</Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {RESERVES.map((res) => (
              <Market
                key={res[ChainId.MAINNET]}
                reserve={res[ChainId.MAINNET]}
                accountData={accountData}
              />
            ))}
            <Market
              key={CELO_MOOLA}
              reserve={CELO_MOOLA}
              accountData={accountData}
            />
          </tbody>
        </Table>
      </Card>
      {/* <Mento /> */}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 100%;
  grid-column-gap: 24px;
  grid-row-gap: 20px;
`;
