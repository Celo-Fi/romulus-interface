import { Anchor } from "@dracula/dracula-ui";
import { ContractReceipt, ContractTransaction } from "ethers";
import React, { useEffect, useState } from "react";

interface IProps {
  value: ContractTransaction | null;
}

export const TransactionHash: React.FC<IProps> = ({ value }: IProps) => {
  const [receipt, setReceipt] = useState<ContractReceipt | null>(null);
  useEffect(() => {
    if (value) {
      void (async () => {
        setReceipt(await value.wait());
      })();
    }
  }, [value]);

  if (!value) {
    return <>--</>;
  }
  return (
    <Anchor href={`https://explorer.celo.org/transaction/${value.hash}`}>
      {value.hash}
      {receipt ? " (completed)" : ""}
    </Anchor>
  );
};
