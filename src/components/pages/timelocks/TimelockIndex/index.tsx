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

  useEffect(() => {
    void (async () => {
      provider.resetEventsBlock(1000000);
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
          // eslint-disable-next-line @typescript-eslint/require-await
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
              queuedAt: queued.blockNumber,
              cancelledTxHash: cancellation?.transactionHash,
              executedTxHash: execution?.transactionHash,

              // queuedAt: (await queued.getBlock()).timestamp,
              // cancelledAt: cancellation
              //   ? (await cancellation.getBlock()).timestamp
              //   : undefined,
              // executedAt: execution
              //   ? (await execution.getBlock()).timestamp
              //   : undefined,
            };
          })
        )
      );
    })();
  }, [timelock, provider]);

  return (
    <Box>
      <Heading as="h2" mb={2}>
        Timelock {timelock.address}
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

const Nav = styled.div`
  display: flex;
  align-items: center;
  a {
    margin-right: 12px;
  }
`;
