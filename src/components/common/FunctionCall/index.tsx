import { BigNumberish } from "ethers";
import { Fragment, TransactionDescription } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";

import { useAbi } from "../../../hooks/useAbi";
import { FunctionWithArgs } from "../FunctionWithArgs";

interface Props {
  address: string;
  data: string;
  value?: BigNumberish;
}

export const FunctionCall: React.FC<Props> = ({
  address,
  data,
  value,
}: Props) => {
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

  if (!parsedTx) {
    return <>{data}</>;
  }

  return (
    <FunctionWithArgs
      callee={address}
      frag={parsedTx.functionFragment}
      args={parsedTx.args}
    />
  );
};
