import { ContractTransaction } from "ethers";
import React, { useEffect, useState } from "react";
import { Button, Card, Heading, Paragraph } from "theme-ui";

import { ReleaseEscrow__factory } from "../../../../generated";
import { usePoolManager } from "../../../../hooks/usePoolManager";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../../hooks/useProviderOrSigner";
import { Address } from "../../../common/Address";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";
import { MINING_RELEASE_ESCROW } from "./config";

export const RefreshPools: React.FC = () => {
  const provider = useProvider();
  const getConnectedSigner = useGetConnectedSigner();
  const { poolManager, poolInfo, operator, owner } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);

  const [currentWeekIndex, setCurrentWeekIndex] = useState<number | null>(null);
  const [numberOfWeeksWithdrawn, setNumberOfWeeksWithdrawn] = useState<
    number | null
  >(null);

  useEffect(() => {
    const releaseEscrow = ReleaseEscrow__factory.connect(
      MINING_RELEASE_ESCROW,
      provider
    );
    void (async () => {
      setCurrentWeekIndex((await releaseEscrow.currentWeekIndex()).toNumber());
      setNumberOfWeeksWithdrawn(
        (await releaseEscrow.numberOfWeeksWithdrawn()).toNumber()
      );
    })();
  }, [provider]);

  const poolsToRefresh = Object.values(poolInfo)
    .filter((p) => p.weight !== 0)
    .map((pool) => pool.stakingToken);

  return (
    <Card p={4}>
      <Heading as="h2" pb={2}>
        Manage Pools
      </Heading>
      <TransactionHash value={tx} />
      <Paragraph>Current week: {currentWeekIndex} (0-indexed)</Paragraph>
      <Paragraph>Number of weeks withdrawn: {numberOfWeeksWithdrawn}</Paragraph>
      {numberOfWeeksWithdrawn !== null && (
        <Button
          onClick={async () => {
            const tx = await ReleaseEscrow__factory.connect(
              MINING_RELEASE_ESCROW,
              await getConnectedSigner()
            ).withdraw(numberOfWeeksWithdrawn + 1, {
              gasLimit: 10_000_000,
            });
            setTx(tx);
          }}
          mr={2}
        >
          Refresh release escrow (up to epoch {numberOfWeeksWithdrawn + 1})
        </Button>
      )}
      <Button
        onClick={async () => {
          const batchSize = 10;
          for (
            let i = 0;
            i < Math.ceil(poolsToRefresh.length / batchSize);
            i++
          ) {
            const start = i * batchSize;
            const end = Math.min(poolsToRefresh.length, (i + 1) * batchSize);
            const tx = await poolManager
              .connect(await getConnectedSigner())
              .initializePeriod(poolsToRefresh.slice(start, end), {
                gasLimit: 10_000_000,
              });
            console.log(`Refreshed from ${start} to ${end}`);
            console.log(`Tx: ${tx.hash}`);
          }
        }}
      >
        Refresh pool manager
      </Button>
      <p>
        Owner: <Address value={owner} />
      </p>
      <p>
        Operator: <Address value={operator} />
      </p>
      <Heading>Pools to refresh</Heading>
      <pre>{JSON.stringify(poolsToRefresh, null, 2)}</pre>
    </Card>
  );
};
