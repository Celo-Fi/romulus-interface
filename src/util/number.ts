import { fromWei } from "web3-utils";
import BN from "bn.js";

export const humanFriendlyWei = (wei: BN | string) => {
  return Number(fromWei(wei)).toLocaleString();
};
