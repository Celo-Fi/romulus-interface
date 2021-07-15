import { Address } from "@celo/contractkit";
import { BigNumber, BigNumberish } from "ethers";
import React from "react";
import { RomulusDelegate__factory } from "../../generated";
import { ProposalState } from "../../types/romulus";
import { useAsyncState } from "../useAsyncState";
import { useProvider } from "../useProviderOrSigner";

type Proposal = [
  BigNumber,
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  boolean,
  boolean
] & {
  id: BigNumber;
  proposer: string;
  eta: BigNumber;
  startBlock: BigNumber;
  endBlock: BigNumber;
  forVotes: BigNumber;
  againstVotes: BigNumber;
  abstainVotes: BigNumber;
  canceled: boolean;
  executed: boolean;
};

export const useProposal = (
  romulusAddress: Address,
  proposalId: BigNumberish
) => {
  const provider = useProvider();
  const proposalCall = React.useCallback(async () => {
    const romulus = RomulusDelegate__factory.connect(romulusAddress, provider);
    const proposal = await romulus.proposals(proposalId);
    const proposalState = await romulus.state(proposalId);
    return { proposal, proposalState };
  }, [romulusAddress, proposalId]);
  return useAsyncState<{
    proposal: Proposal | null;
    proposalState: ProposalState;
  }>({ proposal: null, proposalState: ProposalState.CANCELED }, proposalCall);
};
