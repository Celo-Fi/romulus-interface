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

export const POOF_ADDRESS = "0x00400FcbF0816bebB94654259de7273f4A05c762";
export const RELEASE_POOF_ADDRESS =
  "0x695218A22c805Bab9C6941546CF5395F169Ad871";

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
    const ube = PoofToken__factory.connect(POOF_ADDRESS, provider);
    const releasePOOF = LinearReleaseToken__factory.connect(
      RELEASE_POOF_ADDRESS,
      provider
    );
    void (async () => {
      setStats({
        ubeBalance: await ube.balanceOf(address),
        balance: await releasePOOF.balanceOf(address),
        earned: await releasePOOF.earned(address),
        claimed: await releasePOOF.totalClaimed(address),
      });
    })();
  }, [address, provider]);

  const hasUnclaimedPOOF = stats && !stats.earned.isZero();

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
            <BorderText>POOF Address</BorderText>
            <BorderText>
              <Address value={POOF_ADDRESS} />
            </BorderText>

            <BorderText>Release POOF Address</BorderText>
            <BorderText>
              <Address value={RELEASE_POOF_ADDRESS} />
            </BorderText>

            <BorderText>POOF Balance</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.ubeBalance)} POOF` : "--"}
            </BorderText>

            <BorderText>Your Release POOF</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.balance)} rPOOF` : "--"}
            </BorderText>

            <BorderText>Claimable POOF</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.earned)} POOF` : "--"}
            </BorderText>

            <BorderText>Previously Claimed POOF</BorderText>
            <BorderText>
              {stats ? `${formatEther(stats.claimed)} POOF` : "--"}
            </BorderText>
          </Grid>
          {
            <Button
              mt="sm"
              color={hasUnclaimedPOOF ? "animated" : "purple"}
              disabled={!hasUnclaimedPOOF}
              onClick={async () => {
                const signer = await getConnectedSigner();
                const tx = await LinearReleaseToken__factory.connect(
                  RELEASE_POOF_ADDRESS,
                  signer
                ).claim();
                setTx(tx);
              }}
            >
              {hasUnclaimedPOOF ? "Claim POOF" : "No POOF to claim"}
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
