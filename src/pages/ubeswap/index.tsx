import { useContractKit } from "@celo-tools/use-contractkit";
import { Box, Button, Card, Heading, Table, Text } from "@dracula/dracula-ui";
import { formatEther } from "@ethersproject/units";
import { BigNumber, ContractTransaction } from "ethers";
import React, { useEffect, useState } from "react";

import { Address } from "../../components/common/Address";
import { TransactionHash } from "../../components/common/blockchain/TransactionHash";
import { LinearReleaseToken__factory } from "../../generated/factories/LinearReleaseToken__factory";
import { UbeToken__factory } from "../../generated/factories/UbeToken__factory";
import {
  useLazyConnectedSigner,
  useProvider,
} from "../../hooks/useProviderOrSigner";

interface IReleaseStats {
  ubeBalance: BigNumber;
  balance: BigNumber;
  earned: BigNumber;
  claimed: BigNumber;
}

export const UBE_ADDRESS = "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC";
export const RELEASE_UBE_ADDRESS = "0x5Ed248077bD07eE9B530f7C40BE0c1dAE4c131C0";

const UbeswapIndexPage: React.FC = () => {
  const provider = useProvider();
  const { address } = useContractKit();
  const { getConnectedSigner } = useLazyConnectedSigner();
  const [tx, setTx] = useState<ContractTransaction | null>(null);

  const [stats, setStats] = useState<IReleaseStats | null>(null);

  useEffect(() => {
    const ube = UbeToken__factory.connect(UBE_ADDRESS, provider);
    const releaseUBE = LinearReleaseToken__factory.connect(
      RELEASE_UBE_ADDRESS,
      provider
    );
    void (async () => {
      setStats({
        ubeBalance: await ube.balanceOf(address),
        balance: await releaseUBE.balanceOf(address),
        earned: await releaseUBE.earned(address),
        claimed: await releaseUBE.totalClaimed(address),
      });
    })();
  }, [address, provider]);

  const hasUnclaimedUBE = stats && !stats.earned.isZero();

  return (
    <Box>
      <Heading size="xl">Ubeswap Dashboard</Heading>
      {address ? (
        <Card variant="subtle" p="sm" my="md">
          <Table color="cyan" className="drac-text">
            <tbody>
              <tr>
                <td>UBE Address</td>
                <td>
                  <Address value={UBE_ADDRESS} />
                </td>
              </tr>
              <tr>
                <td>Release UBE Address</td>
                <td>
                  <Address value={RELEASE_UBE_ADDRESS} />
                </td>
              </tr>
              <tr>
                <td>UBE Balance</td>
                <td>{stats ? `${formatEther(stats.ubeBalance)} UBE` : "--"}</td>
              </tr>
              <tr>
                <td>Your Release UBE</td>
                <td>{stats ? `${formatEther(stats.balance)} rUBE` : "--"}</td>
              </tr>
              <tr>
                <td>Claimable UBE</td>
                <td>{stats ? `${formatEther(stats.earned)} UBE` : "--"}</td>
              </tr>
              <tr>
                <td>Previously Claimed UBE</td>
                <td>{stats ? `${formatEther(stats.claimed)} UBE` : "--"}</td>
              </tr>
            </tbody>
          </Table>
          {
            <Button
              mt="sm"
              color={hasUnclaimedUBE ? "animated" : "purple"}
              disabled={!hasUnclaimedUBE}
              onClick={async () => {
                const signer = await getConnectedSigner();
                const tx = await LinearReleaseToken__factory.connect(
                  RELEASE_UBE_ADDRESS,
                  signer
                ).claim();
                setTx(tx);
              }}
            >
              {hasUnclaimedUBE ? "Claim UBE" : "No UBE to claim"}
            </Button>
          }
          {tx && (
            <Text>
              Claiming transaction <TransactionHash value={tx} />
            </Text>
          )}
        </Card>
      ) : (
        <Text color="red">
          Please connect your wallet in order to use this page.
        </Text>
      )}
    </Box>
  );
};

export default UbeswapIndexPage;
