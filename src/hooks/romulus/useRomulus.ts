import { useContractKit } from "@celo-tools/use-contractkit";
import { Address } from "@celo/contractkit";
import { BigNumberish } from "ethers";
import React from "react";
import { PoofToken__factory } from "../../generated";
import { BIG_ZERO, ZERO_ADDRESS } from "../../util/constants";
import { getRomulusInfo } from "../../util/getRomulusInfo";
import { useAsyncState } from "../useAsyncState";
import { useProvider } from "../useProviderOrSigner";

type Romulus = [
  boolean,
  string,
  string,
  string,
  string,
  BigNumberish,
  BigNumberish
];

const initialRomulus: Romulus = [
  false,
  "",
  "",
  ZERO_ADDRESS,
  ZERO_ADDRESS,
  BIG_ZERO,
  BIG_ZERO,
];

export const useRomulus = (romulusAddress: Address) => {
  const { address } = useContractKit();
  const provider = useProvider();

  const romulusCalls = React.useCallback(async (): Promise<Romulus> => {
    const { romulus, tokenAddress, releaseTokenAddress } = await getRomulusInfo(
      romulusAddress as string,
      provider
    );

    const token = PoofToken__factory.connect(tokenAddress, provider);
    const tokenSymbol = await token.symbol();
    const tokenDelegate = address
      ? await token.delegates(address)
      : ZERO_ADDRESS;

    let releaseTokenSymbol = "";
    let releaseTokenDelegate = "";
    const hasReleaseToken = releaseTokenAddress !== ZERO_ADDRESS;
    if (hasReleaseToken) {
      const releaseToken = PoofToken__factory.connect(
        releaseTokenAddress,
        provider
      );
      releaseTokenSymbol = await releaseToken.symbol();
      releaseTokenDelegate = address
        ? await releaseToken.delegates(address)
        : ZERO_ADDRESS;
    }

    const quorumVotes = await romulus.quorumVotes();
    const proposalThreshold = await romulus.proposalThreshold();

    return [
      hasReleaseToken,
      tokenSymbol,
      releaseTokenSymbol,
      tokenDelegate,
      releaseTokenDelegate,
      quorumVotes,
      proposalThreshold,
    ];
  }, [address, romulusAddress]);

  return useAsyncState<
    [boolean, string, string, string, string, BigNumberish, BigNumberish]
  >(initialRomulus, romulusCalls);
};
