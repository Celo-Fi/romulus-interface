import React from "react";
import { Address } from "@celo/contractkit";

import { useAsyncState } from "../useAsyncState";
import { PoofToken__factory, RomulusDelegate__factory } from "../../generated";
import { useProvider } from "../useProviderOrSigner";
import { BIG_ZERO, ZERO_ADDRESS } from "../../util/constants";
import { BigNumber } from "ethers";
import { TypedEvent } from "../../generated/commons";

type DelegateChangeEvent = TypedEvent<
  [string, BigNumber, BigNumber] & {
    delegate: string;
    previousBalance: BigNumber;
    newBalance: BigNumber;
  }
>;

export const useTopDelegates = (
  romulusAddress: Address,
  numDelegates: number
) => {
  const provider = useProvider();
  const eventsCall = React.useCallback(async () => {
    if (!romulusAddress) {
      return [];
    }
    const romulus = RomulusDelegate__factory.connect(romulusAddress, provider);
    const token = PoofToken__factory.connect(await romulus.token(), provider);
    const filter = token.filters.DelegateVotesChanged(null, null, null);
    const tokenEvents = await token.queryFilter(filter);

    const releaseTokenAddress = await romulus.releaseToken();
    let releaseTokenEvents: DelegateChangeEvent[] = [];
    if (releaseTokenAddress !== ZERO_ADDRESS) {
      const releaseToken = PoofToken__factory.connect(
        await romulus.releaseToken(),
        provider
      );
      releaseTokenEvents = await releaseToken.queryFilter(filter);
    }
    const delegateToPower: Record<string, BigNumber> = tokenEvents.reduce(
      (acc, event) => ({
        ...acc,
        [event.args.delegate]: event.args.newBalance,
      }),
      {}
    );
    const delegateToReleasePower: Record<string, BigNumber> =
      releaseTokenEvents.reduce(
        (acc, event) => ({
          ...acc,
          [event.args.delegate]: event.args.newBalance,
        }),
        {}
      );
    Object.entries(delegateToReleasePower).forEach(
      ([delegate, releasePower]) => {
        if (!delegateToPower[delegate]) {
          delegateToPower[delegate] = BIG_ZERO;
        }
        delegateToPower[delegate] =
          delegateToPower[delegate]!.add(releasePower);
      }
    );
    return Object.entries(delegateToPower)
      .filter((v) => !v[1].eq(BIG_ZERO))
      .sort((a: any, b: any) => b[1].sub(a[1]))
      .slice(0, numDelegates);
  }, []);

  return useAsyncState([], eventsCall);
};
