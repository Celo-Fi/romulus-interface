import { BigNumberish } from "ethers";
import React from "react";

import { useParsedTransaction } from "../../../hooks/useParsedTransaction";
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
  const parsedTx = useParsedTransaction({ address, data, value });

  if (!parsedTx) {
    return (
      <div tw="flex flex-col gap-1">
        <div tw="break-all text-gray-400 text-sm">{data}</div>
      </div>
    );
  }

  return (
    <FunctionWithArgs
      callee={address}
      frag={parsedTx.functionFragment}
      args={parsedTx.args}
    />
  );
};
