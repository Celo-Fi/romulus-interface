import {
  BigNumber,
  Contract,
  ContractReceipt,
  ContractTransaction,
} from "ethers";

// https://stackoverflow.com/questions/63789897/typescript-remove-last-element-from-parameters-tuple-currying-away-last-argum
type Head<T extends any[]> = Required<T> extends [...infer H, any] ? H : never;
type Last<T extends any[]> = Required<T> extends [...any[], infer T]
  ? T
  : never;

export const runTx = async <
  T extends Contract,
  M extends string & keyof T["estimateGas"] & keyof T
>(
  contract: T & {
    estimateGas: {
      [k in M]: (...args: Parameters<T[M]>) => Promise<BigNumber>;
    };
    functions: {
      [k in M]: (...args: Parameters<T[M]>) => Promise<ContractTransaction>;
    };
  },
  method: M,
  args: Head<Parameters<T[M]>>,
  overrides?: Last<Parameters<T[M]>> & Record<string, unknown>
): Promise<ContractReceipt | null> => {
  try {
    const gasEstimate = await contract.estimateGas[method](
      ...args,
      overrides ?? {}
    );
    const tx = (await contract.functions[method](...args, {
      ...(overrides ?? {}),
      gasLimit: gasEstimate.mul(110).div(100),
    })) as ContractTransaction;
    console.log(`Sent tx: ${tx.hash}`);
    const result = await tx.wait();
    console.log(`Tx complete: ${tx.hash}`);
    return result;
  } catch (e) {
    console.error(e);
  }
  return null;
};
