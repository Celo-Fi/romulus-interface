import MultiSigJSON from "@celo/contracts/build/MultiSig.json";
import { deployContract } from "@ubeswap/solidity-create2-deployer";
import { ContractTransaction, Signer } from "ethers";
import { Interface } from "ethers/lib/utils";
import { useRouter } from "next/router";
import React, { useState } from "react";

import MultiSigABI from "../../../../abis/MultiSig.json";
import { MultiSig__factory } from "../../../../generated/factories/MultiSig__factory";
import { MultiSig } from "../../../../generated/MultiSig";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { ParamsForm } from "../../../common/TransactionBuilder/ParamsForm";

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
      <p>This page allows deploying a new Celo multisig contract.</p>
      <ParamsForm
        params={
          multisigInterface.functions["initialize(address[],uint256,uint256)"]
            ?.inputs ?? []
        }
        values={params}
        onChange={setParams}
      />
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
            ...(params as Parameters<MultiSig["initialize"]>)
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
