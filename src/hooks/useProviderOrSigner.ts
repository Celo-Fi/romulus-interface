import { useContractKit } from "@celo-tools/use-contractkit";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { ExternalProvider } from "@ethersproject/providers/lib/web3-provider";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useProvider = (): Web3Provider => {
  const { kit } = useContractKit();
  const provider = kit.web3.currentProvider as unknown as ExternalProvider;
  return useMemo(() => {
    return new Web3Provider(provider);
  }, [provider]);
};

export const useProviderOrSigner = (): Web3Provider | JsonRpcSigner => {
  const { kit } = useContractKit();
  const provider = useProvider();
  return useMemo(() => {
    return kit.defaultAccount
      ? provider.getSigner(kit.defaultAccount)
      : provider;
  }, [provider, kit.defaultAccount]);
};

export const useGetConnectedSigner = (): (() => Promise<JsonRpcSigner>) => {
  const { kit, connect } = useContractKit();
  const signer = useProviderOrSigner();
  return useCallback(async () => {
    if (kit.defaultAccount) {
      return signer as JsonRpcSigner;
    }
    const connector = await connect();
    const nextKit = await connector.initialise();
    const nextProvider = nextKit.kit.web3
      .currentProvider as unknown as ExternalProvider;
    return new Web3Provider(nextProvider).getSigner(nextKit.kit.defaultAccount);
  }, [signer, kit, connect]);
};

export const useLazyConnectedSigner = (): {
  signer: JsonRpcSigner | null;
  address: string | null;
  getConnectedSigner: () => Promise<JsonRpcSigner>;
} => {
  const getConnectedSigner = useGetConnectedSigner();
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const getConnectedSignerCb = useCallback(async () => {
    const theSigner = await getConnectedSigner();
    setSigner(theSigner);
    return theSigner;
  }, [getConnectedSigner, setSigner]);
  return {
    signer,
    getConnectedSigner: getConnectedSignerCb,
    address: signer?._address ?? null,
  };
};

export const useConnectedSigner = (): JsonRpcSigner | null => {
  const getConnectedSigner = useGetConnectedSigner();
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  useEffect(() => {
    void (async () => {
      setSigner(await getConnectedSigner());
    })();
  }, [getConnectedSigner, setSigner]);
  return signer;
};
