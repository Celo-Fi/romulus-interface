import { useContractKit } from "@celo-tools/use-contractkit";
import styled from "@emotion/styled";
import { formatEther } from "@ethersproject/units";
import { BigNumber, ContractTransaction } from "ethers";
import React, { useEffect, useState } from "react";
import { Box, Button, Card, Grid, Heading, Text } from "theme-ui";

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

const BorderText = styled(Text)({
  border: "1px solid white",
  padding: "12px",
});

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
      if (address) {
        setStats({
          ubeBalance: await ube.balanceOf(address),
          balance: await releaseUBE.balanceOf(address),
          earned: await releaseUBE.earned(address),
          claimed: await releaseUBE.totalClaimed(address),
        });
      }
    })();
  }, [address, provider]);

  const hasUnclaimedUBE = stats && !stats.earned.isZero();

  return (
    <Box>
      <Heading as="h1" mb={3}>
        Ubeswap Dashboard
      </Heading>
      {address ? (
        <Card variant="subtle" p="sm" my="md">
          <Grid
            sx={{
              border: "2px solid",
              borderColor: "primary",
              borderRadius: 4,
              p: 4,
            }}
            gap={0}
            columns={[2, "auto 1fr"]}
            mb={4}
          >
            <BorderText>UBE Address</BorderText>
            <BorderText>
              <Address value={UBE_ADDRESS} />
            </BorderText>

            <BorderText>Release UBE Address</BorderText>
            <BorderText>
              <Address value={RELEASE_UBE_ADDRESS} />
            </BorderText>

            <BorderText>UBE Balance</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.ubeBalance)} UBE` : "--"}
            </BorderText>

            <BorderText>Your Release UBE</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.balance)} rUBE` : "--"}
            </BorderText>

            <BorderText>Claimable UBE</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.earned)} UBE` : "--"}
            </BorderText>

            <BorderText>Previously Claimed UBE</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.claimed)} UBE` : "--"}
            </BorderText>
          </Grid>
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
