import {
  BigNumber,
  BigNumberish,
  Contract,
  ContractReceipt,
  ContractTransaction,
} from "ethers";

// https://stackoverflow.com/questions/63789897/typescript-remove-last-element-from-parameters-tuple-currying-away-last-argum
type Head<T extends any[]> = Required<T> extends [...infer H, any] ? H : never;
type Last<T extends any[]> = Required<T> extends [...any[], infer T]
  ? T
  : never;

type TypedContract<
  T extends Contract,
  M extends string & keyof T["estimateGas"] & keyof T
> = T & {
  callStatic: {
    [k in M]: (...args: Parameters<T[M]>) => Promise<unknown>;
  };
  estimateGas: {
    [k in M]: (...args: Parameters<T[M]>) => Promise<BigNumber>;
  };
  functions: {
    [k in M]: (...args: Parameters<T[M]>) => Promise<ContractTransaction>;
  };
};

interface ContractCall<
  T extends Contract,
  M extends string & keyof T["estimateGas"] & keyof T
> {
  contract: TypedContract<T, M>;
  method: M;
  args: unknown[];
  value?: BigNumberish;
}

export const estimateGas = async <
  T extends Contract,
  M extends string & keyof T["estimateGas"] & keyof T
>(
  call: ContractCall<T, M>
): Promise<BigNumber> => {
  const { contract, method, args, value } = call;
  const valueArg = value ? [{ value }] : [];
  const argsWithValue = [...args, ...valueArg];
  try {
    return await contract.estimateGas[method](...argsWithValue);
  } catch (gasError) {
    console.debug(
      "Gas estimate failed, trying eth_call to extract error",
      call
    );
    try {
      const result: unknown = await contract.callStatic[method](
        ...argsWithValue
      );
      console.debug(
        "Unexpected successful call after failed estimate gas",
        call,
        gasError,
        result
      );
      throw new Error(
        "Unexpected issue with estimating the gas. Please try again."
      );
    } catch (callError) {
      const typedCallError = callError as { reason?: string };
      console.debug("Call threw error", call, callError);
      throw new Error(typedCallError.reason ?? "unknown error");
    }
  }
};

export const runTx = async <
  T extends Contract,
  M extends string & keyof T["estimateGas"] & keyof T
>(
  contract: TypedContract<T, M>,
  method: M,
  args: Head<Parameters<T[M]>>,
  overrides?: Last<Parameters<T[M]>> & Record<string, unknown>
): Promise<ContractReceipt | null> => {
  const call = {
    contract,
    method,
    args,
    value: overrides?.value,
  } as ContractCall<T, M>;
  try {
    const gasEstimate = await estimateGas(call);
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
