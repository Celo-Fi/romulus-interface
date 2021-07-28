import { Fragment, getAddress, Interface } from "ethers/lib/utils";
import { useEffect, useState } from "react";

import { knownABIUrls } from "../components/common/FunctionCall/knownABIs";

export const useAbi = (address: string): Interface | null => {
  const [abi, setAbi] = useState<Interface | null>(null);

  useEffect(() => {
    void (async () => {
      if (!address) {
        return;
      }
      const abiURL = knownABIUrls[getAddress(address)];
      if (!abiURL) {
        return;
      }
      const result = await fetch(abiURL);
      const json = (await result.json()) as readonly Fragment[];
      setAbi(new Interface(json));
    })();
  }, [address]);

  return abi;
};
