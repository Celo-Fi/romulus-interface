import { Card, Heading, Table } from "@dracula/dracula-ui";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { CELO, ChainId } from "@ubeswap/sdk";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";

import { LendingPool__factory } from "../../../../generated";
import { useConnectedSigner } from "../../../../hooks/useProviderOrSigner";

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

const RESERVES = [addresses.cUSD, addresses.cEUR, addresses.CELO];

const moolaLendingPools = {
  // Addresses from: https://github.com/moolamarket/moola
  [ChainId.ALFAJORES]: {
    lendingPool: "0x0886f74eEEc443fBb6907fB5528B57C28E813129",
    lendingPoolCore: "0x090D652d1Bb0FEFbEe2531e9BBbb3604bE71f5de",
  },
  [ChainId.MAINNET]: {
    lendingPool: "0xc1548F5AA1D76CDcAB7385FA6B5cEA70f941e535",
    lendingPoolCore: "0xAF106F8D4756490E7069027315F4886cc94A8F73",
  },
};

interface IMoolaAccountData {
  totalLiquidityETH: BigNumber;
  totalCollateralETH: BigNumber;
  totalBorrowsETH: BigNumber;
  totalFeesETH: BigNumber;
  availableBorrowsETH: BigNumber;
  currentLiquidationThreshold: BigNumber;
  ltv: BigNumber;
  healthFactor: BigNumber;
}

export const MoolaIndex: React.FC = () => {
  const signer = useConnectedSigner();
  const [accountData, setAccountData] = useState<IMoolaAccountData | null>(
    null
  );

  useEffect(() => {
    if (!signer) {
      return;
    }
    const lendingPool = LendingPool__factory.connect(
      moolaLendingPools[ChainId.MAINNET].lendingPool,
      signer
    );

    void (async () => {
      try {
        setAccountData(
          await lendingPool.callStatic.getUserAccountData(
            await signer.getAddress()
          )
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [signer]);

  return (
    <Wrapper>
      <div
        css={css`
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <img src="https://i.giphy.com/media/OuyIXPoaO5X7G/giphy.webp" />
      </div>
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
              <td>{accountData.healthFactor.toString()}</td>
            </tr>
          </Table>
        )}
      </Card>
      <Card p="md" variant="subtle" color="purple">
        <Heading pb="sm">Lend</Heading>
      </Card>
      <Card p="md" variant="subtle" color="purple">
        <Heading pb="sm">Borrow</Heading>
      </Card>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 24px;
  grid-row-gap: 20px;
`;
