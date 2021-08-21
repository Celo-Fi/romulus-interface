import { Fragment } from "ethers/lib/utils";
import ReleasePOOFMetadata from "../../../abis/poof/ReleasePOOF.json";
import TokenAllocatorMetadata from "../../../abis/poof/TokenAllocator.json";
import MinerMetadata from "../../../abis/poof/Miner.json";
import TornadoProxyMetadata from "../../../abis/poof/TornadoProxy.json";
import TimelockAbi from "../../../abis/ITimelock.json";
import ERC20Abi from "../../../abis/ERC20.json";

const MULTISIG_ABI =
  "https://gist.githubusercontent.com/macalinao/265ef9f40d13b28a64e5ad19eec94f62/raw/4723e984481558895728542304a9727d85d9c259/multisig.json";

const TIMELOCK_ABI =
  "https://gist.githubusercontent.com/macalinao/1c1650844df047eeb815f4365478ca3a/raw/844b3c735a638ef2fe561cd86e6e23064e8faecd/timelock.json";

// TODO(igm): find a more scalable way to associate addresses with ABIs
export const knownABIUrls: Record<string, string> = {
  "0x7Cda830369F5Cff005dD078A4bbf0A37e8085f8B": MULTISIG_ABI,
  "0xDd038bd0244fFB7c6736439fB217586207979f9C": TIMELOCK_ABI,
};

export const knownABIs: Record<string, Fragment[]> = {
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
};
