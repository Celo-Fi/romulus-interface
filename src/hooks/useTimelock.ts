import { useEffect } from "react";

import { ITimelock, ITimelock__factory } from "../generated";
import { useProvider } from "./useProviderOrSigner";

export const useTimelock = (address: string): ITimelock => {
  const provider = useProvider();
  const timelock = ITimelock__factory.connect(address, provider);

  useEffect(() => {
    void (async () => {
      provider.resetEventsBlock(0);
      const cancels = await timelock.queryFilter(
        timelock.filters.CancelTransaction(null, null, null, null, null, null)
      );
      console.log("Cancels", cancels);
    })();
  });

  return timelock;
};
