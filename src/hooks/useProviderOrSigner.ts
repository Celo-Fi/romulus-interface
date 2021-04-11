import { useContractKit } from "@celo-tools/use-contractkit";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { useMemo } from "react";

export const useProviderOrSigner = (): Web3Provider | JsonRpcSigner => {
  const { kit, address } = useContractKit();
  const provider = kit.web3.currentProvider as unknown;
  return useMemo(() => {
    const ethersProvider = new Web3Provider(provider);
    return address ? ethersProvider.getSigner(address) : ethersProvider;
  }, [address, provider]);
};
