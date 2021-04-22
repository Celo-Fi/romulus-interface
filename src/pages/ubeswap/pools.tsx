import { Box, Button, Heading } from "@dracula/dracula-ui";
import { ContractTransaction } from "ethers";
import React, { useState } from "react";

import { Address } from "../../components/common/Address";
import { usePoolManager } from "../../hooks/usePoolManager";

const PoolsPage: React.FC = () => {
  const { poolManager, poolInfo, operator, owner } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);
  return (
    <Box>
      <Button
        onClick={async () => {
          const tx = await poolManager.initializePeriod(
            Object.values(poolInfo).map(({ stakingToken }) => stakingToken),
            {
              gasLimit: 1000000,
            }
          );
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
      <pre>{JSON.stringify(tx, null, 2)}</pre>
      <pre>{JSON.stringify(poolInfo, null, 2)}</pre>
      <Heading>Staking tokens</Heading>
      <pre>
        {JSON.stringify(
          Object.values(poolInfo).map((pool) => pool.stakingToken),
          null,
          2
        )}
      </pre>
    </Box>
  );
};

export default PoolsPage;
