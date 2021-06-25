import { Address, ContractKit } from "@celo/contractkit";
import { useMemo } from "react";
import { RomulusKit } from "romulus-kit";

export const useRomulus = (kit: ContractKit, address?: Address) => {
  return useMemo(() => {
    return new RomulusKit(kit, address);
  }, [kit, address]);
};
