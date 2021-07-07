import { useContractKit } from "@celo-tools/use-contractkit";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { CELO, ChainId } from "@ubeswap/sdk";
import { BigNumber } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";
import React, { useCallback, useEffect, useState } from "react";
import { Box, Card, Flex, Heading, Text, Themed } from "theme-ui";

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

  const refreshAccountData = useCallback(async () => {
    if (!address) {
      return;
    }
    const lendingPool = LendingPool__factory.connect(
      moolaLendingPools[ChainId.MAINNET].lendingPool,
      provider
    );
    try {
      setAccountData(await lendingPool.callStatic.getUserAccountData(address));
    } catch (e) {
      console.error(e);
    }
  }, [address, setAccountData, provider]);

  useEffect(() => {
    const interval = setInterval(() => void refreshAccountData(), 1000);
    return () => clearInterval(interval);
  }, [refreshAccountData]);

  return (
    <Wrapper>
      <Flex sx={{ gap: 4 }}>
        <Card>
          <Heading as="h2">Moola Market Interface</Heading>
          <Text>This is an experimental interface. Use at your own risk.</Text>
        </Card>
        {address !== "" && (
          <Card
            sx={{
              flexGrow: 1,
            }}
          >
            <Heading as="h2">My Account</Heading>
            {accountData && (
              <Box
                css={css`
                  width: fit-content;
                  td {
                    padding: var(--spacing-sm);
                  }
                `}
              >
                <Themed.table css={{ borderSpacing: 4 }}>
                  <tbody>
                    <tr>
                      <td>
                        <Text>Total Liquidity</Text>
                      </td>
                      <td>
                        <Text>
                          {formatEther(accountData.totalLiquidityETH)} CELO
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text>Total Collateral</Text>
                      </td>
                      <td>
                        <Text>
                          {formatEther(accountData.totalCollateralETH)} CELO
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text>Total Borrows</Text>
                      </td>
                      <td>
                        <Text>
                          {formatEther(accountData.totalBorrowsETH)} CELO
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text>Total Lifetime Fees</Text>
                      </td>
                      <td>
                        <Text>
                          {formatEther(accountData.totalFeesETH)} CELO
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text>Available Borrows</Text>
                      </td>
                      <td>
                        <Text>
                          {formatEther(accountData.availableBorrowsETH)} CELO
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text>Current Liquidiation Threshold</Text>
                      </td>
                      <td>
                        <Text>
                          {accountData.currentLiquidationThreshold.toString()}%
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text>LTV</Text>
                      </td>
                      <td>
                        <Text>{accountData.ltv.toString()}%</Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text>Health Factor</Text>
                      </td>
                      <td>
                        <Text>
                          {parseFloat(
                            formatUnits(accountData.healthFactor, 18)
                          ).toFixed(4)}{" "}
                          {interpretHealthFactor(accountData.healthFactor)}
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </Themed.table>
              </Box>
            )}
          </Card>
        )}
      </Flex>
      <Card>
        <Heading as="h2">Markets</Heading>
        <Themed.table>
          <thead>
            <tr>
              <Themed.th>
                <Text sx={{ fontWeight: "bold" }}>Reserve Asset</Text>
              </Themed.th>
              <Themed.th>
                <Text sx={{ fontWeight: "semibold" }}>Market Info</Text>
              </Themed.th>
              <Themed.th>
                <Text sx={{ fontWeight: "semibold" }}>User Info</Text>
              </Themed.th>
              <Themed.th>
                <Text sx={{ fontWeight: "semibold" }}>Collateral Enabled?</Text>
              </Themed.th>
              <Themed.th>
                <Text sx={{ fontWeight: "semibold" }}>Actions</Text>
              </Themed.th>
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
        </Themed.table>
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
