import { ContractTransaction } from "ethers";
import React, { useEffect, useState } from "react";
import { Button, Card, Heading, Paragraph } from "theme-ui";

import {
  MultiSig__factory,
  ReleaseEscrow__factory,
} from "../../../../generated";
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
            const multisig = MultiSig__factory.connect(
              operator!,
              await getConnectedSigner()
            );
            const releaseEscrow = ReleaseEscrow__factory.connect(
              MINING_RELEASE_ESCROW,
              provider
            );
            const data = releaseEscrow.interface.encodeFunctionData(
              "withdraw",
              [numberOfWeeksWithdrawn + 1]
            );
            const tx = await multisig.submitTransaction(
              releaseEscrow.address,
              0,
              data
            );
            setTx(tx);
          }}
          mr={2}
        >
          Refresh release escrow (up to epoch {numberOfWeeksWithdrawn + 1})
        </Button>
      )}
      <Button
        onClick={async () => {
          const multisig = MultiSig__factory.connect(
            operator!,
            await getConnectedSigner()
          );
          const data = poolManager.interface.encodeFunctionData(
            "beginInitializePeriod"
          );
          const tx = await multisig.submitTransaction(
            poolManager.address,
            0,
            data
          );
          console.log(`Initialized period: ${tx.hash}`);
        }}
      >
        Begin initialize period
      </Button>
      <Button
        onClick={async () => {
          const multisig = MultiSig__factory.connect(
            operator!,
            await getConnectedSigner()
          );
          const batchSize = 20;
          for (
            let i = 0;
            i < Math.ceil(poolsToRefresh.length / batchSize);
            i++
          ) {
            const start = i * batchSize;
            const end = Math.min(poolsToRefresh.length, (i + 1) * batchSize);
            const data = poolManager.interface.encodeFunctionData(
              "batchRefreshPools",
              [poolsToRefresh.slice(start, end)]
            );
            const tx = await multisig.submitTransaction(
              poolManager.address,
              0,
              data
            );
            console.log(`Refreshed from ${start} to ${end}`);
            console.log(`Tx: ${tx.hash}`);
          }
        }}
      >
        Refresh pool manager
      </Button>
      <Button
        mb={2}
        onClick={async () => {
          const multisig = MultiSig__factory.connect(
            operator!,
            await getConnectedSigner()
          );
          const data = poolManager.interface.encodeFunctionData(
            "commitInitializePeriod"
          );
          const tx = await multisig.submitTransaction(
            poolManager.address,
            0,
            data
          );
          console.log(`Commited period: ${tx.hash}`);
        }}
      >
        Commit initialize period
      </Button>
      <p>
        Owner: <Address value={owner} />
      </p>
      <p>
        Operator: <Address value={operator} />
      </p>
    </Card>
  );
};
