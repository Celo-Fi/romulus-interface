import { useContractKit } from "@celo-tools/use-contractkit";
import { Web3Provider } from "@ethersproject/providers";
import { useEffect } from "react";

import { ITimelock, ITimelock__factory } from "../generated";

export const useTimelock = (address: string): ITimelock => {
  const { kit } = useContractKit();
  const provider = new Web3Provider(kit.web3.currentProvider as unknown);
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
