import MultiSigJSON from "@celo/contracts/build/MultiSig.json";
import { deployContract } from "@ubeswap/solidity-create2-deployer";
import { ContractTransaction, Signer } from "ethers";
import { Interface } from "ethers/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

import MultiSigABI from "../../../../abis/MultiSig.json";
import { MultiSig__factory } from "../../../../generated/factories/MultiSig__factory";
import { MultiSig } from "../../../../generated/MultiSig";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { FunctionWithArgs } from "../../../common/FunctionWithArgs";
import { ParamsForm } from "../../../common/TransactionBuilder/ParamsForm";

type Head<T extends unknown[]> = Required<T> extends [...infer H, unknown]
  ? H
  : never;
type Last<T extends Array<unknown>> = Required<T> extends [
  ...unknown[],
  infer L
]
  ? L
  : never;

export const MultisigCreate: React.FC = () => {
  const router = useRouter();
  const multisigInterface = new Interface(MultiSigABI);
  const getConnectedSigner = useGetConnectedSigner();

  const [params, setParams] = useState<readonly unknown[]>([]);

  const [address, setAddress] = useState<string | null>(null);
  const [initializeTx, setInitializeTx] = useState<ContractTransaction | null>(
    null
  );

  return (
    <div>
      <h1>Create a new Multisig wallet</h1>
      <p>
        This page allows deploying a new Celo multisig contract.{" "}
        <Link href="/multisigs/source">
          <a>View the source here.</a>
        </Link>
      </p>
      <ParamsForm
        params={
          multisigInterface.functions["initialize(address[],uint256,uint256)"]
            ?.inputs ?? []
        }
        paramsDoc={
          MultiSigJSON.devdoc.methods["initialize(address[],uint256,uint256)"]
            .params
        }
        values={params}
        onChange={setParams}
      />
      <h3>Preview</h3>
      <FunctionWithArgs
        frag={
          multisigInterface.functions["initialize(address[],uint256,uint256)"]!
        }
        args={params}
      />
      <br />
      <br />
      <button
        onClick={async () => {
          const signer = await getConnectedSigner();
          console.log(
            "deploying contract using " +
              (await (signer as Signer).getAddress())
          );
          const result = await deployContract({
            salt: `${Math.random()}`,
            contractBytecode: MultiSigJSON.bytecode,
            signer: signer as Signer,
          });
          setAddress(result.address);
          console.log("deployed", result);

          const multisig = MultiSig__factory.connect(result.address, signer);

          const tx = await multisig.initialize(
            ...([...params] as Head<Parameters<MultiSig["initialize"]>>),
            {
              gasLimit: 2000000,
            }
          );
          setInitializeTx(tx);
          await tx.wait();
          await router.push(`/multisigs/${multisig.address}`);
        }}
      >
        Deploy
      </button>
      <p>Address: {address ? address : "--"}</p>
      {initializeTx && <p>Initializing at {initializeTx.hash}</p>}
    </div>
  );
};
