import { Button, Card, Heading } from "@dracula/dracula-ui";
import { ContractTransaction } from "ethers";
import React, { useState } from "react";

import { ReleaseEscrow__factory } from "../../../../generated";
import { usePoolManager } from "../../../../hooks/usePoolManager";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { Address } from "../../../common/Address";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";

const MINING_RELEASE_ESCROW = "0x9d0a92AA8832518328D14Ed5930eC6B44448165e";

export const RefreshPools: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const { poolManager, poolInfo, operator, owner } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);

  const poolsToRefresh = Object.values(poolInfo)
    .filter((p) => p.weight !== 0)
    .map((pool) => pool.stakingToken);

  return (
    <Card p="md" variant="subtle" color="purple">
      <Heading>Manage Pools</Heading>
      <TransactionHash value={tx} />
      <Button
        onClick={async () => {
          const tx = await ReleaseEscrow__factory.connect(
            MINING_RELEASE_ESCROW,
            await getConnectedSigner()
          ).withdraw(7, {
            gasLimit: 10_000_000,
          });
          setTx(tx);
        }}
      >
        Refresh release escrow
      </Button>
      <Button
        onClick={async () => {
          const tx = await poolManager
            .connect(await getConnectedSigner())
            .initializePeriod(poolsToRefresh, {
              gasLimit: 10_000_000,
            });
          setTx(tx);
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
