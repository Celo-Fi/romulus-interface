import BN from "bn.js";
import { fromWei } from "web3-utils";

export const humanFriendlyWei = (wei: BN | string) => {
  return Number(fromWei(wei)).toLocaleString();
};
