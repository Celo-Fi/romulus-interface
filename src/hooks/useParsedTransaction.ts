import { BigNumberish } from "ethers";
import { TransactionDescription } from "ethers/lib/utils";
import { useEffect, useState } from "react";

import { useAbi } from "./useAbi";

interface Props {
  address: string;
  data: string;
  value?: BigNumberish;
}

export const useParsedTransaction = ({
  address,
  data,
  value,
}: Props): TransactionDescription | null => {
  const abi = useAbi(address);
  const [parsedTx, setParsedTx] = useState<TransactionDescription | null>(null);

  useEffect(() => {
    try {
      const theTx = abi?.parseTransaction({ data, value });
      if (theTx) {
        setParsedTx(theTx);
      }
    } catch (e) {
      console.error(e);
    }
  }, [abi, data, value]);

  return parsedTx;
};
