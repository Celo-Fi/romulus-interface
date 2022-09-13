import { Address } from "@celo/contractkit";
import { BigNumberish } from "ethers";
import React from "react";
import { PoofToken__factory } from "../../generated";
import { useProvider } from "../../hooks/useProviderOrSigner";
import { BIG_ZERO, ZERO_ADDRESS } from "../../util/constants";
import { getRomulusInfo } from "../../util/getRomulusInfo";
import { useAsyncState } from "../useAsyncState";

const initialVotingTokens = {
  balance: BIG_ZERO,
  releaseBalance: BIG_ZERO,
  votingPower: BIG_ZERO,
  releaseVotingPower: BIG_ZERO,
};

export const useVotingTokens = (
  romulusAddress: Address,
  address: Address | null,
  blockNumber: BigNumberish
) => {
  const provider = useProvider();
  const votingPowerCallback = React.useCallback(async () => {
    if (!address) {
      return initialVotingTokens;
    }
    const { tokenAddress, releaseTokenAddress } = await getRomulusInfo(
      romulusAddress,
      provider
    );

    const token = PoofToken__factory.connect(tokenAddress, provider);
    const balance = await token.balanceOf(address);
    const votingPower = await token.getPriorVotes(address, blockNumber);

    let releaseBalance = BIG_ZERO;
    let releaseVotingPower = BIG_ZERO;
    if (releaseTokenAddress !== ZERO_ADDRESS) {
      const releaseToken = PoofToken__factory.connect(
        releaseTokenAddress,
        provider
      );
      releaseBalance = await releaseToken.balanceOf(address);
      releaseVotingPower = await releaseToken.getPriorVotes(
        address,
        blockNumber
      );
    }
    return {
      address,
      romulusAddress,
      provider,
      balance,
      releaseBalance,
      votingPower,
      releaseVotingPower,
    };
  }, [romulusAddress, provider, address, blockNumber]);
  return useAsyncState(initialVotingTokens, votingPowerCallback);
};
