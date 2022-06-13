import { useProvider as useUCKProvider } from "@celo-tools/use-contractkit";
import { providers } from "ethers";

export const useProvider = (): providers.Provider => {
  return useUCKProvider() as providers.Provider;
};
