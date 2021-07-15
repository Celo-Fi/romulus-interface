import { useContractKit } from "@celo-tools/use-contractkit";
import { Address } from "@celo/contractkit";
import { BigNumber } from "ethers";
import React from "react";
import { RomulusDelegate__factory } from "../../generated";
import { TypedEvent } from "../../generated/commons";
import { useProvider } from "../../hooks/useProviderOrSigner";
import { useAsyncState } from "../useAsyncState";

type VoteMap = {
  [proposalId: string]: TypedEvent<
    [string, BigNumber, number, BigNumber, string] & {
      voter: string;
      proposalId: BigNumber;
      support: number;
      votes: BigNumber;
      reason: string;
    }
  >;
};

export const useVoteCasts = (romulusAddress: Address) => {
  const { address } = useContractKit();
  const provider = useProvider();
  const voteCastsCallback = React.useCallback(async () => {
    if (!romulusAddress || !address) {
      return {};
    }
    const romulus = RomulusDelegate__factory.connect(romulusAddress, provider);
    const filter = romulus.filters.VoteCast(address, null, null, null, null);
    const voteEvents = await romulus.queryFilter(filter);
    return voteEvents.reduce((acc, event) => {
      acc[event.args.proposalId.toString()] = event;
      return acc;
    }, {} as VoteMap);
  }, [romulusAddress, provider, address]);
  return useAsyncState<VoteMap>({}, voteCastsCallback);
};
