import { ContractKit, Address } from "@celo/contractkit";
import { useEffect, useMemo, useState } from "react";
import { RomulusKit } from "romulus-kit";

export const useRomulus = (kit: ContractKit, address?: Address) => {
  return useMemo(() => {
    if (address) {
      return new RomulusKit(kit, address);
    }
  }, [kit, address]);
};

export function useAsyncState<T>(
  initialState: T,
  asyncGetter: Promise<T> | undefined,
  deps: any[]
) {
  const [state, setState] = useState<T>(initialState);
  useEffect(() => {
    asyncGetter?.then((v) => setState(v)).catch(console.error);
  }, deps);
  return state;
}
