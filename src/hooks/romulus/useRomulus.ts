import { useContractKit } from "@celo-tools/use-contractkit";
import { Address } from "@celo/contractkit";
import React from "react";
import { PoofToken__factory, RomulusDelegate__factory } from "../../generated";
import { ZERO_ADDRESS } from "../../util/constants";
import { useAsyncState } from "../useAsyncState";
import { useProvider } from "../useProviderOrSigner";

export const useRomulus = (romulusAddress: Address) => {
  const { address } = useContractKit();
  const provider = useProvider();
  const romulusCalls = React.useCallback(async (): Promise<
    [boolean, string, string, string, string]
  > => {
    if (!address) {
      return [false, "", "", ZERO_ADDRESS, ZERO_ADDRESS];
    }
    const romulus = RomulusDelegate__factory.connect(
      romulusAddress as string,
      provider
    );
    const token = PoofToken__factory.connect(await romulus.token(), provider);
    const tokenSymbol = await token.symbol();
    const tokenDelegate = await token.delegates(address);

    let releaseTokenSymbol = "";
    let releaseTokenDelegate = "";
    const releaseTokenAddress = await romulus.releaseToken();
    const hasReleaseToken = releaseTokenAddress !== ZERO_ADDRESS;
    if (hasReleaseToken) {
      const releaseToken = PoofToken__factory.connect(
        releaseTokenAddress,
        provider
      );
      releaseTokenSymbol = await releaseToken.symbol();
      releaseTokenDelegate = await releaseToken.delegates(address);
    }

    return [
      hasReleaseToken,
      tokenSymbol,
      releaseTokenSymbol,
      tokenDelegate,
      releaseTokenDelegate,
    ];
  }, [address, romulusAddress]);

  return useAsyncState<[boolean, string, string, string, string]>(
    [false, "", "", ZERO_ADDRESS, ZERO_ADDRESS],
    romulusCalls
  );
};
