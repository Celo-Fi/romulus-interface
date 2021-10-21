import styled from "@emotion/styled";
import { BigNumber } from "ethers";
import React, { useEffect, useState } from "react";
import { Box, Button, Card, Heading, Link, Text } from "theme-ui";

import { useProvider } from "../../../../hooks/useProviderOrSigner";
import { useTimelock } from "../../../../hooks/useTimelock";
import { formatDuration } from "../../../../util/dateTime";
import { Address } from "../../../common/Address";
import { TimelockTransactionCard } from "./TimelockTransactionCard";

export interface TimelockTransaction {
  /**
   * Title to use when describing this transaction.
   */
  title: string;

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
  const { timelock, config } = useTimelock(timelockAddress);
  const provider = useProvider();

  const [transactions, setTransactions] =
    useState<readonly TimelockTransaction[]>();

  // run this whenever the timelock changes
  useEffect(() => {
    // first block to fetch from
    const fromBlock = 1_000_000;
    const provTimelock = timelock.connect(provider);
    void (async () => {
      const [prevQueued, prevExecuted, prevCancelled] = await Promise.all([
        provTimelock.queryFilter(
          timelock.filters.QueueTransaction(null, null, null, null, null, null),
          fromBlock
        ),
        provTimelock.queryFilter(
          timelock.filters.ExecuteTransaction(
            null,
            null,
            null,
            null,
            null,
            null
          ),
          fromBlock
        ),
        provTimelock.queryFilter(
          timelock.filters.CancelTransaction(
            null,
            null,
            null,
            null,
            null,
            null
          ),
          fromBlock
        ),
      ]);

      setTransactions(
        prevQueued
          .map((queued) => {
            const execution = prevExecuted.find(
              (tx) => tx.args.txHash === queued.args.txHash
            );
            const cancellation = prevCancelled.find(
              (tx) => tx.args.txHash === queued.args.txHash
            );

            return {
              title: queued.args.signature
                ? queued.args.signature
                : queued.args.txHash,

              target: queued.args.target,
              txHash: queued.args.txHash,
              value: queued.args.value,
              signature: queued.args.signature,
              data: queued.args.data,
              eta: queued.args.eta.toNumber(),

              queuedTxHash: queued.transactionHash,
              queuedAt: queued.blockNumber,
              cancelledTxHash: cancellation?.transactionHash,
              executedTxHash: execution?.transactionHash,
              executedAt: execution?.blockNumber,
            };
          })
          .sort((a, b) => {
            // reverse chronological order
            return a.queuedAt > b.queuedAt
              ? -1
              : a.queuedAt === b.queuedAt
              ? 0
              : 1;
          })
      );
    })();
  }, [timelock, provider]);

  return (
    <Box>
      <Heading as="h2" mb={2}>
        Timelock: <Address value={timelock.address} link={false} />
      </Heading>
      <Link href={`/timelocks/${timelockAddress}/queue-transaction`}>
        <Button>Add Transaction</Button>
      </Link>
      <Card mt={3}>
        <Heading as="h3" mb={2}>
          Details
        </Heading>
        {config && (
          <table css={{ borderSpacing: 4 }}>
            <tbody>
              <tr>
                <td>
                  <Text>Admin</Text>
                </td>
                <td>
                  <Text>
                    <Address value={config.admin} />
                  </Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text>Pending Admin</Text>
                </td>
                <td>
                  <Text>
                    <Address value={config.pendingAdmin} />
                  </Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text>Delay</Text>
                </td>
                <td>
                  <Text>{formatDuration(config.delay)}</Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text>Grace Period</Text>
                </td>
                <td>
                  <Text>{formatDuration(config.gracePeriod)}</Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text>Maximum Delay</Text>
                </td>
                <td>
                  <Text>{formatDuration(config.maximumDelay)}</Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text>Minimum Delay</Text>
                </td>
                <td>
                  <Text>{formatDuration(config.minimumDelay)}</Text>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Card>
      <Submissions>
        {transactions?.map((tx, i) => (
          <TimelockTransactionCard key={i} tx={tx} timelock={timelock} />
        ))}
      </Submissions>
    </Box>
  );
};

const Submissions = styled.div`
  display: grid;
  grid-row-gap: 24px;
`;
