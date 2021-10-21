import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { toast } from "react-toastify";

import { ITimelock } from "../../../../generated";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { AsyncButton } from "../../../common/AsyncButton";
import { AttributeList } from "../../../common/AttributeList";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";
import { FunctionCall } from "../../../common/FunctionCall";
import { TXHash } from "../../../common/TXHash";
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
      <div tw="flex flex-col">
        <span tw="text-gray-100 text-base font-medium mb-2">
          Transaction Details
        </span>
        <AttributeList
          data={{
            Signature: tx.signature,
            Target: tx.target,
            ETA: new Date(tx.eta * 1_000).toLocaleString(),
            Value: tx.value.toNumber(),
          }}
        />
      </div>
      <div tw="flex flex-col">
        <span tw="text-gray-100 text-base font-medium mb-2">
          Transaction Lifecycle
        </span>
        <AttributeList
          data={{
            "Executed TX": <TXHash value={tx.executedTxHash} />,
            "Cancelled TX": <TXHash value={tx.cancelledTxHash} />,
            "Queued TX": <TXHash value={tx.queuedTxHash} />,
          }}
        />
      </div>
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
              .executeTransaction(
                tx.target,
                tx.value,
                tx.signature,
                tx.data,
                tx.eta
              );
            toast(<TransactionHash value={result} />);
          }}
        >
          Execute
        </AsyncButton>
      </div>
    </div>
  );
};
