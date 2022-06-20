import { useGetConnectedSigner as useUCKGetConnectedSigner } from "@celo-tools/use-contractkit";
import { Signer } from "ethers";
import { useCallback } from "react";

export const useGetConnectedSigner = (): (() => Promise<Signer>) => {
  const getConnectedSigner = useUCKGetConnectedSigner();
  return useCallback(
    async () => (await getConnectedSigner()) as Signer,
    [getConnectedSigner]
  );
};
