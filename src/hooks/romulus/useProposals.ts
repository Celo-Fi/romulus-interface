import { Address } from "@celo/contractkit";
import React from "react";

import { RomulusDelegate__factory } from "../../generated";
import { useProvider } from "../../hooks/useProviderOrSigner";
import { useAsyncState } from "../useAsyncState";

export const useProposals = (romulusAddress: Address | undefined) => {
  const provider = useProvider();
  const proposalsCall = React.useCallback(async () => {
    if (!romulusAddress) {
      return [];
    }
    const romulus = RomulusDelegate__factory.connect(romulusAddress, provider);
    const filter = romulus.filters.ProposalCreated(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
    const proposalEvents = await romulus.queryFilter(filter);
    return proposalEvents;
  }, [romulusAddress, provider]);
  return useAsyncState([], proposalsCall);
};
