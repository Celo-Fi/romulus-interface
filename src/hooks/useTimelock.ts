import { useEffect, useMemo, useState } from "react";

import { ITimelock, ITimelock__factory } from "../generated";
import { useProvider } from "./useProviderOrSigner";

interface ITimelockConfig {
  gracePeriod: number;
  maximumDelay: number;
  minimumDelay: number;
  admin: string;
  pendingAdmin: string;
  delay: number;
}

export const useTimelock = (
  address: string
): { timelock: ITimelock; config: ITimelockConfig | null } => {
  const provider = useProvider();
  const timelock = useMemo(
    () => ITimelock__factory.connect(address, provider),
    [address, provider]
  );
  const [config, setConfig] = useState<ITimelockConfig | null>(null);

  useEffect(() => {
    void (async () => {
      const gracePeriod = (await timelock.callStatic.GRACE_PERIOD()).toNumber();
      const maximumDelay = (
        await timelock.callStatic.MAXIMUM_DELAY()
      ).toNumber();
      const minimumDelay = (
        await timelock.callStatic.MINIMUM_DELAY()
      ).toNumber();
      const admin = await timelock.callStatic.admin();
      const pendingAdmin = await timelock.callStatic.pendingAdmin();
      const delay = (await timelock.callStatic.delay()).toNumber();
      setConfig({
        gracePeriod,
        maximumDelay,
        minimumDelay,
        admin,
        pendingAdmin,
        delay,
      });
    })();
  }, [timelock]);

  return { timelock, config };
};
