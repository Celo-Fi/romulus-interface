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
}: Props): { tx: TransactionDescription | null; error: unknown | null } => {
  const abi = useAbi(address);
  const [parsedTx, setParsedTx] = useState<TransactionDescription | null>(null);
  const [parseError, setParseError] = useState<unknown | null>(null);

  useEffect(() => {
    try {
      const theTx = abi?.parseTransaction({ data, value });
      if (theTx) {
        setParsedTx(theTx);
      }
    } catch (e) {
      setParseError(e);
    }
  }, [abi, data, value]);

  return {
    tx: parsedTx,
    error: parseError,
  };
};
