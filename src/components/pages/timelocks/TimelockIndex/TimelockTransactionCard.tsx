import React from "react";
import { toast } from "react-toastify";

import { ITimelock, MultiSig__factory } from "../../../../generated";
import { useParsedTransaction } from "../../../../hooks/useParsedTransaction";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../../hooks/useProviderOrSigner";
import { Address } from "../../../common/Address";
import { AsyncButton } from "../../../common/AsyncButton";
import { AttributeList } from "../../../common/AttributeList";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";
import { FunctionCall } from "../../../common/FunctionCall";
import { FunctionWithArgs } from "../../../common/FunctionWithArgs";
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
  const { tx: parsedTx } = useParsedTransaction({
    address: tx.target,
    data: tx.data,
    value: tx.value,
  });
  const getConnectedSigner = useGetConnectedSigner();
  const provider = useProvider();
  return (
    <div tw="bg-gray-800 text-white p-6 rounded-xl border border-gray-700 shadow flex flex-col gap-4">
      <div tw="flex items-center justify-between">
        <h2 tw="text-white font-semibold text-base m-0">
          {parsedTx ? (
            <FunctionWithArgs
              callee={tx.target}
              frag={parsedTx.functionFragment}
              args={parsedTx.args}
              inline
            />
          ) : tx.signature ? (
            <span>
              <Address value={tx.target} />.{tx.signature}
            </span>
          ) : (
            tx.title
          )}
        </h2>
      </div>
      <div tw="flex flex-col">
        <span tw="text-gray-100 text-base font-medium mb-2">
          Transaction Details
        </span>
        <AttributeList
          data={{
            Hash: tx.txHash,
            Signature: tx.signature,
            Target: (
              <>
                <Address value={tx.target} />
                {tx.target === timelock.address && (
                  <span tw="ml-2 text-green-400 font-semibold">(Self)</span>
                )}
              </>
            ),
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
            const admin = await timelock.admin();
            const adminCode = await provider.getCode(admin);
            if (adminCode === "0x") {
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
            } else {
              // Assume multisig
              const multisig = MultiSig__factory.connect(admin, signer);
              const result = await multisig.submitTransaction(
                timelock.address,
                0,
                timelock.interface.encodeFunctionData("executeTransaction", [
                  tx.target,
                  tx.value,
                  tx.signature,
                  tx.data,
                  tx.eta,
                ])
              );
              toast(<TransactionHash value={result} />);
            }
          }}
        >
          Execute
        </AsyncButton>
      </div>
    </div>
  );
};
