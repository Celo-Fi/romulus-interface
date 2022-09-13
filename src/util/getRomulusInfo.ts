import { Address } from "@celo/contractkit";
import { governanceLookup } from "../pages/romulus";
import {
  RomulusDelegate__factory,
  MoolaDelegate__factory,
  RomulusDelegate,
  MoolaDelegate,
} from "../generated";
import { providers, Signer } from "ethers";
import { ZERO_ADDRESS } from "./constants";

interface RomulusInfo {
  romulus: RomulusDelegate | MoolaDelegate;
  releaseTokenAddress: Address;
  tokenAddress: Address;
}

export const getRomulusInfo = async (
  romulusAddress: Address,
  signerOrProvider: providers.Provider | Signer
): Promise<RomulusInfo> => {
  const projectName = governanceLookup[romulusAddress]?.name;
  let romulus: RomulusDelegate | MoolaDelegate;
  switch (projectName) {
    case "Moola":
      romulus = MoolaDelegate__factory.connect(
        romulusAddress,
        signerOrProvider
      );
      return {
        romulus,
        releaseTokenAddress: ZERO_ADDRESS,
        tokenAddress: await romulus.moo(),
      };
    default:
      romulus = RomulusDelegate__factory.connect(
        romulusAddress,
        signerOrProvider
      );
      return {
        romulus,
        releaseTokenAddress: await romulus.releaseToken(),
        tokenAddress: await romulus.token(),
      };
  }
};
