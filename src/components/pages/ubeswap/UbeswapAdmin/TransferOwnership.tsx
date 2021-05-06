import { Button, Card, Heading } from "@dracula/dracula-ui";
import { ContractTransaction } from "ethers";
import React, { useState } from "react";

import { usePoolManager } from "../../../../hooks/usePoolManager";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { useTimelock } from "../../../../hooks/useTimelock";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";

const TIMELOCK_EXECUTIVE = "0x1BDB37DAA42E37bFCa4C5536AcF93b1173588981";

const OPERATOR = "0x489AAc7Cb9A3B233e4a289Ec92284C8d83d49c6f";

export const TransferOwnership: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const { timelock: executive } = useTimelock(TIMELOCK_EXECUTIVE);
  const { poolManager } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);

  return (
    <Card p="md" variant="subtle" color="purple">
      <Heading>Transfer pool manager ownership</Heading>
      <TransactionHash value={tx} />
      <Button
        onClick={async () => {
          const signer = await getConnectedSigner();
          const data = poolManager.interface.encodeFunctionData(
            "transferOwnership",
            [OPERATOR]
          );
          const encodedParams = poolManager.interface._encodeParams(
            poolManager.interface.functions["transferOwnership(address)"]
              .inputs,
            [OPERATOR]
          );
          const tx = await executive
            .connect(signer)
            .queueTransaction(
              poolManager.address,
              0,
              "transferOwnership(address)",
              encodedParams,
              Math.floor(new Date().getTime() / 1000) + 2 * 24 * 60 * 60 + 600
            );
          console.log("Queued", tx);
          setTx(tx);
        }}
      >
        Transfer pool manager ownership
      </Button>
    </Card>
  );
};
