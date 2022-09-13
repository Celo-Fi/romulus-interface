import React from "react";
import { Address } from "@celo/contractkit";

import { useAsyncState } from "../useAsyncState";
import { PoofToken__factory } from "../../generated";
import { useProvider } from "../useProviderOrSigner";
import { BIG_ZERO, ZERO_ADDRESS } from "../../util/constants";
import { BigNumber } from "ethers";
import { TypedEvent } from "../../generated/commons";
import { getPastEvents } from "../../util/events";
import { getRomulusInfo } from "../../util/getRomulusInfo";

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
  const BATCH_SIZE = 100_000;

  const eventsCall = React.useCallback(async () => {
    if (!romulusAddress) {
      return [];
    }
    const latestBlockNumber = await provider.getBlockNumber();
    const { tokenAddress, releaseTokenAddress } = await getRomulusInfo(
      romulusAddress,
      provider
    );
    const token = PoofToken__factory.connect(tokenAddress, provider);
    const filter = token.filters.DelegateVotesChanged(null, null, null);
    const promiseEvents = [];
    for (let i = 0; i < Math.ceil(latestBlockNumber / BATCH_SIZE); i++) {
      promiseEvents.push(
        getPastEvents<DelegateChangeEvent>(
          token,
          filter,
          Math.max(i * BATCH_SIZE, 0),
          Math.min((i + 1) * BATCH_SIZE, latestBlockNumber)
        )
      );
    }
    const allPromiseEvents = await Promise.all(promiseEvents);
    const tokenEvents = allPromiseEvents.flat();

    let releaseTokenEvents: DelegateChangeEvent[] = [];
    if (releaseTokenAddress !== ZERO_ADDRESS) {
      const releaseToken = PoofToken__factory.connect(
        releaseTokenAddress,
        provider
      );
      const promiseEvents = [];
      for (let i = 0; i < Math.ceil(latestBlockNumber / BATCH_SIZE); i++) {
        promiseEvents.push(
          getPastEvents<DelegateChangeEvent>(
            releaseToken,
            filter,
            Math.max(i * BATCH_SIZE, 0),
            Math.min((i + 1) * BATCH_SIZE, latestBlockNumber)
          )
        );
      }
      const allPromiseEvents = await Promise.all(promiseEvents);
      releaseTokenEvents = allPromiseEvents.flat();
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
  }, [romulusAddress, provider]);

  return useAsyncState([], eventsCall);
};
