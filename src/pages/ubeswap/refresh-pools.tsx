import { useContractKit } from "@celo-tools/use-contractkit";
import { ContractTransaction } from "ethers";
import { useState } from "react";

import { usePoolManager } from "../../hooks/usePoolManager";

const RefreshPoolsPage: React.FC = () => {
  const kit = useContractKit();
  const { poolManager, poolInfo, operator, owner } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);
  return (
    <div>
      <button onClick={() => kit.connect()}>Connect wallet</button>
      <button
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
      </button>
      <p>Owner: {owner}</p>
      <p>Operator: {operator}</p>
      <pre>{JSON.stringify(tx, null, 2)}</pre>
      <pre>{JSON.stringify(poolInfo, null, 2)}</pre>
    </div>
  );
};

export default RefreshPoolsPage;
