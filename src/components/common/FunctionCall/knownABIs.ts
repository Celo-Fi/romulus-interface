import { Fragment } from "ethers/lib/utils";
import { mapValues } from "lodash";

import ERC20Abi from "../../../abis/ERC20.json";
import TimelockAbi from "../../../abis/ITimelock.json";
import VoterAbi from "../../../abis/Voter.json";
import MultiSig from "../../../abis/MultiSig.json";
import MinerMetadata from "../../../abis/poof/Miner.json";
import ReleasePOOFMetadata from "../../../abis/poof/ReleasePOOF.json";
import RewardsCELOMetadata from "../../../abis/poof/RewardsCELO.json";
import TokenAllocatorMetadata from "../../../abis/poof/TokenAllocator.json";
import TornadoProxyMetadata from "../../../abis/poof/TornadoProxy.json";
import PoolManager from "../../../abis/PoolManager.json";
import UbeswapTokenAllocatorAbi from "../../../abis/ubeswap/TokenAllocator.json";
import UbeswapFactory from "../../../abis/UbeswapFactory.json";

const MULTISIG_ABI =
  "https://gist.githubusercontent.com/macalinao/265ef9f40d13b28a64e5ad19eec94f62/raw/4723e984481558895728542304a9727d85d9c259/multisig.json";

const TIMELOCK_ABI =
  "https://gist.githubusercontent.com/macalinao/1c1650844df047eeb815f4365478ca3a/raw/844b3c735a638ef2fe561cd86e6e23064e8faecd/timelock.json";

// TODO(igm): find a more scalable way to associate addresses with ABIs
export const knownABIUrls: Record<string, string> = {
  "0x7Cda830369F5Cff005dD078A4bbf0A37e8085f8B": MULTISIG_ABI,
  "0xDd038bd0244fFB7c6736439fB217586207979f9C": TIMELOCK_ABI,
};

export const KNOWN_ADDRESSES: Record<
  string,
  {
    name: string;
    abi?: Fragment[];
  }
> = {
  // Ubeswap
  // https://docs.ubeswap.org/code-and-contracts/contract-addresses
  "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC": {
    name: "UBE Token",
    abi: ERC20Abi as unknown as Fragment[],
  },
  "0x471EcE3750Da237f93B8E339c536989b8978a438": {
    name: "CELO",
    abi: ERC20Abi as unknown as Fragment[],
  },
  "0x918146359264C492BD6934071c6Bd31C854EDBc3": {
    name: "mcUSD",
    abi: ERC20Abi as unknown as Fragment[],
  },
  "0x5Ed248077bD07eE9B530f7C40BE0c1dAE4c131C0": {
    name: "Release UBE",
  },
  "0x62d5b84bE28a183aBB507E125B384122D2C25fAE": {
    name: "Ubeswap Factory",
    abi: UbeswapFactory as unknown as Fragment[],
  },
  "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2": {
    name: "Ubeswap Pool Manager",
    abi: PoolManager as unknown as Fragment[],
  },
  "0x1BDB37DAA42E37bFCa4C5536AcF93b1173588981": {
    name: "Ubeswap Executive Timelock",
    abi: TimelockAbi as unknown as Fragment[],
  },
  "0x177B042b284dD9B830d4eb179695bCC14044fD1A": {
    name: "Ubeswap Community Timelock",
    abi: TimelockAbi as unknown as Fragment[],
  },
  "0xC45Cc58205132Fe29e0F96BAA3f4FA2BD88cD6D9": {
    name: "Ubeswap Celo Reserve Timelock",
    abi: TimelockAbi as unknown as Fragment[],
  },
  "0x489AAc7Cb9A3B233e4a289Ec92284C8d83d49c6f": {
    name: "Ubeswap Founding Operator",
  },
  "0x97A9681612482A22b7877afbF8430EDC76159Cae": {
    name: "Ubeswap Governance Fees Timelock",
    abi: TimelockAbi as unknown as Fragment[],
  },
  "0xB58DA472Fd4ba76696DbF8Ba3cC23580C26093dA": {
    name: "Ubeswap Multisig 1",
    abi: MultiSig as unknown as Fragment[],
  },
  "0xb4340a85f4E00778a3B018f51B1dd66Ca296501D": {
    name: "Abstain Voter",
    abi: VoterAbi as unknown as Fragment[],
  },
  "0x682049ca0221d3f79a7f670f7b94612e12ba581f": {
    name: "For Voter",
    abi: VoterAbi as unknown as Fragment[],
  },
  "0x5cfb8153a3c5861e5714a5902155bca7e041e613": {
    name: "Against Voter",
    abi: VoterAbi as unknown as Fragment[],
  },
};

export const knownABIs: Record<string, Fragment[]> = {
  "0x9a4f417f7C23EDA400536C9fE3B14b1494c1C6a1":
    UbeswapTokenAllocatorAbi as unknown as Fragment[],
  "0x695218A22c805Bab9C6941546CF5395F169Ad871":
    ReleasePOOFMetadata.abi as unknown as Fragment[],
  "0x0Dd3E8caFF2B914becDb8700Db32d0C9dC34E318":
    TokenAllocatorMetadata.abi as unknown as Fragment[],
  "0x06c2B37ef603F1f817F229112AAb2D57dF0091F9":
    TokenAllocatorMetadata.abi as unknown as Fragment[],
  "0x00400FcbF0816bebB94654259de7273f4A05c762":
    ERC20Abi as unknown as Fragment[],
  "0x4415062d2AABDE111B2952d4428571bB289dD1Dc":
    MinerMetadata.abi as unknown as Fragment[],
  "0xbF4cb62Ab7E6EfDd496142Ef26589dF06F1467bc":
    TornadoProxyMetadata.abi as unknown as Fragment[],
  "0xAFB9EAa0A60b07AD29084055930D797D4Dc3E378":
    TimelockAbi as unknown as Fragment[],
  "0x1a8Dbe5958c597a744Ba51763AbEBD3355996c3e":
    RewardsCELOMetadata.abi as unknown as Fragment[],

  ...mapValues(KNOWN_ADDRESSES, (addr) => addr.abi),
};
