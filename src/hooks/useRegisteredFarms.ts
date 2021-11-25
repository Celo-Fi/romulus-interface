import { useCallback } from "react";

import { FarmRegistry__factory } from "../generated";
import { useAsyncState } from "./useAsyncState";
import { useProviderOrSigner } from "./useProviderOrSigner";

export const FARM_REGISTRY_ADDRESS =
  "0xa2bf67e12EeEDA23C7cA1e5a34ae2441a17789Ec";

type RegisteredFarms = Record<string, boolean> | null;

export const useRegisteredFarms = (): [RegisteredFarms, () => void] => {
  const provider = useProviderOrSigner();
  const call = useCallback(async () => {
    const farmRegistry = FarmRegistry__factory.connect(
      FARM_REGISTRY_ADDRESS,
      provider
    );
    const registeredFarms: RegisteredFarms = {};
    await farmRegistry
      .queryFilter(farmRegistry.filters.FarmInfo(null, null, null))
      .then((events) =>
        events.forEach((e) => {
          registeredFarms[e.args.stakingAddress.toLowerCase()] = true;
        })
      );

    return registeredFarms;
  }, [provider]);

  return useAsyncState(null, call);
};
