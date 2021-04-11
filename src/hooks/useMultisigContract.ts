import { useState } from "react";

import { MultiSig, MultiSig__factory } from "../generated";
import { useProvider } from "./useProviderOrSigner";

/**
 * Loads a multisig contract.
 * @param address
 * @returns
 */
export const useMultisigContract = (address: string): MultiSig => {
  const provider = useProvider();
  const [multisig] = useState<MultiSig>(
    MultiSig__factory.connect(address, provider)
  );
  return multisig;
};
