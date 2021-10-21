import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

import { ITimelock } from "../../../../generated";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { AsyncButton } from "../../../common/AsyncButton";
import { FunctionCall } from "../../../common/FunctionCall";
import { TimelockTransaction } from ".";

interface Props {
  timelock: ITimelock;
  tx: TimelockTransaction;
}

export const TimelockTransactionCard: React.FC<Props> = ({
  tx,
  timelock,
}: Props) => {
  const getConnectedSigner = useGetConnectedSigner();
  return (
    <div tw="bg-gray-900 text-white p-4 rounded-xl border border-gray-700 shadow flex flex-col gap-4">
      <div tw="flex items-center justify-between">
        <h2 tw="text-white font-semibold text-base">{tx.txHash}</h2>
        <a
          href={`https://explorer.celo.org/tx/${tx.queuedTxHash}`}
          target="_blank"
          rel="noreferrer"
        >
          <FaExternalLinkAlt />
        </a>
      </div>
      <p tw="break-all">{tx.signature}</p>
      <div tw="max-w-full w-full flex flex-col gap-1">
        <span tw="text-gray-100 text-base font-medium">Transaction Data</span>
        <FunctionCall address={tx.target} data={tx.data} value={tx.value} />
      </div>
      <div>
        <AsyncButton
          errorTitle="Error executing Timelock transaction"
          onClick={async () => {
            const signer = await getConnectedSigner();
            const result = await timelock
              .connect(signer)
              .executeTransaction(tx.target, tx.value, "", tx.data, tx.eta);
            console.log(result);
          }}
        >
          Execute
        </AsyncButton>
      </div>
    </div>
  );
};
