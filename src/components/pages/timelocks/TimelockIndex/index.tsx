import styled from "@emotion/styled";
import { BigNumber } from "ethers";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { useProvider } from "../../../../hooks/useProviderOrSigner";
import { useTimelock } from "../../../../hooks/useTimelock";
import { TimelockTransactionCard } from "./TimelockTransactionCard";

export interface TimelockTransaction {
  txHash: string;
  target: string;
  value: BigNumber;
  signature: string;
  data: string;
  eta: number;

  queuedTxHash: string;
  queuedAt: number;
  executedTxHash?: string;
  executedAt?: number;
  cancelledTxHash?: string;
  cancelledAt?: number;
}

interface Props {
  address: string;
}

export const TimelockIndex: React.FC<Props> = ({
  address: timelockAddress,
}: Props) => {
  const timelock = useTimelock(timelockAddress);
  const provider = useProvider();

  const [transactions, setTransactions] = useState<
    readonly TimelockTransaction[]
  >();

  useEffect(() => {
    void (async () => {
      provider.resetEventsBlock(0);
      const provTimelock = timelock.connect(provider);
      const prevQueued = await provTimelock.queryFilter(
        timelock.filters.QueueTransaction(null, null, null, null, null, null)
      );
      const prevExecuted = await provTimelock.queryFilter(
        timelock.filters.ExecuteTransaction(null, null, null, null, null, null)
      );
      const prevCancelled = await provTimelock.queryFilter(
        timelock.filters.CancelTransaction(null, null, null, null, null, null)
      );

      setTransactions(
        await Promise.all(
          prevQueued.map(async (queued) => {
            const execution = prevExecuted.find(
              (tx) => tx.args.txHash === queued.args.txHash
            );
            const cancellation = prevCancelled.find(
              (tx) => tx.args.txHash === queued.args.txHash
            );

            return {
              target: queued.args.target,
              txHash: queued.args.txHash,
              value: queued.args.value,
              signature: queued.args.signature,
              data: queued.args.data,
              eta: queued.args.eta.toNumber(),

              queuedTxHash: queued.transactionHash,
              queuedAt: (await queued.getBlock()).timestamp,
              cancelledTxHash: cancellation?.transactionHash,
              cancelledAt: cancellation
                ? (await cancellation.getBlock()).timestamp
                : undefined,
              executedTxHash: execution?.transactionHash,
              executedAt: execution
                ? (await execution.getBlock()).timestamp
                : undefined,
            };
          })
        )
      );
    })();
  }, [timelock, provider]);

  return (
    <Wrapper>
      <h1>Timelock {timelock.address}</h1>
      <Nav>
        <Link href={`/timelocks/${timelockAddress}/add-transaction`}>
          <a>Add Transaction</a>
        </Link>
      </Nav>
      <Submissions>
        {transactions?.map((tx, i) => (
          <TimelockTransactionCard key={i} tx={tx} />
        ))}
      </Submissions>
    </Wrapper>
  );
};

const Submissions = styled.div`
  display: grid;
  grid-row-gap: 24px;
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
  a {
    margin-right: 12px;
  }
`;

const Wrapper = styled.div`
  max-width: 100%;
  width: 720px;
  margin: 0 auto;
`;
