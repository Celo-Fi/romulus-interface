import { ContractTransaction } from "ethers";
import React, { useState } from "react";
import { Button, Card, Heading, Input } from "theme-ui";

import { usePoolManager } from "../../../../hooks/usePoolManager";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";

export const SetOperator: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const { poolManager } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);
  const [operator, setOperator] = useState<string>("");

  return (
    <Card p={4}>
      <Heading as="h2" pb={2}>
        Set Operator
      </Heading>
      <TransactionHash value={tx} />
      <Input
        my={2}
        id="address"
        name="address"
        placeholder="New operator"
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
      />
      <Button
        onClick={async () => {
          const signer = await getConnectedSigner();
          const tx = await poolManager.connect(signer).setOperator(operator);
          setTx(tx);
        }}
      >
        Set Pool Manager Operator
      </Button>
    </Card>
  );
};
