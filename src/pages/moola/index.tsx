import { useContractKit } from "@celo-tools/use-contractkit";
import styled from "@emotion/styled";
import { formatEther } from "@ethersproject/units";
import { BigNumber, ContractTransaction } from "ethers";
import React, { useEffect, useState } from "react";
import { Box, Button, Card, Grid, Heading, Text } from "theme-ui";

import { Address } from "../../components/common/Address";
import { TransactionHash } from "../../components/common/blockchain/TransactionHash";
import { LinearReleaseToken__factory } from "../../generated/factories/LinearReleaseToken__factory";
import { PoofToken__factory } from "../../generated/factories/PoofToken__factory";
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

export const MOO_ADDRESS = "0x17700282592D6917F6A73D0bF8AcCf4D578c131e";
export const RELEASE_MOO_ADDRESS = "0xFCC5A03BF803213E478ccbE6517857faa3136978";

const BorderText = styled(Text)({
  border: "1px solid white",
  padding: "12px",
});

const PoofIndexPage: React.FC = () => {
  const provider = useProvider();
  const { address } = useContractKit();
  const { getConnectedSigner } = useLazyConnectedSigner();
  const [tx, setTx] = useState<ContractTransaction | null>(null);

  const [stats, setStats] = useState<IReleaseStats | null>(null);

  useEffect(() => {
    const ube = PoofToken__factory.connect(MOO_ADDRESS, provider);
    const releaseMOO = LinearReleaseToken__factory.connect(
      RELEASE_MOO_ADDRESS,
      provider
    );
    void (async () => {
      if (address) {
        setStats({
          ubeBalance: await ube.balanceOf(address),
          balance: await releaseMOO.balanceOf(address),
          earned: await releaseMOO.earned(address),
          claimed: await releaseMOO.totalClaimed(address),
        });
      }
    })();
  }, [address, provider]);

  const hasUnclaimedMOO = stats && !stats.earned.isZero();

  return (
    <Box>
      <Heading as="h1" mb={3}>
        Poof Dashboard
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
            <BorderText>MOO Address</BorderText>
            <BorderText>
              <Address value={MOO_ADDRESS} />
            </BorderText>

            <BorderText>Release MOO Address</BorderText>
            <BorderText>
              <Address value={RELEASE_MOO_ADDRESS} />
            </BorderText>

            <BorderText>MOO Balance</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.ubeBalance)} MOO` : "--"}
            </BorderText>

            <BorderText>Your Release MOO</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.balance)} rMOO` : "--"}
            </BorderText>

            <BorderText>Claimable MOO</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.earned)} MOO` : "--"}
            </BorderText>

            <BorderText>Previously Claimed MOO</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.claimed)} MOO` : "--"}
            </BorderText>
          </Grid>
          {
            <Button
              mt="sm"
              color={hasUnclaimedMOO ? "animated" : "purple"}
              disabled={!hasUnclaimedMOO}
              onClick={async () => {
                const signer = await getConnectedSigner();
                const tx = await LinearReleaseToken__factory.connect(
                  RELEASE_MOO_ADDRESS,
                  signer
                ).claim();
                setTx(tx);
              }}
            >
              {hasUnclaimedMOO ? "Claim MOO" : "No MOO to claim"}
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

export default PoofIndexPage;
