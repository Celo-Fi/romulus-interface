const MULTISIG_ABI =
  "https://gist.githubusercontent.com/macalinao/265ef9f40d13b28a64e5ad19eec94f62/raw/4723e984481558895728542304a9727d85d9c259/multisig.json";

const TIMELOCK_ABI =
  "https://gist.githubusercontent.com/macalinao/1c1650844df047eeb815f4365478ca3a/raw/844b3c735a638ef2fe561cd86e6e23064e8faecd/timelock.json";

// TODO(igm): find a more scalable way to associate addresses with ABIs
export const knownABIs: Record<string, string> = {
  "0x7Cda830369F5Cff005dD078A4bbf0A37e8085f8B": MULTISIG_ABI,
  "0xDd038bd0244fFB7c6736439fB217586207979f9C": TIMELOCK_ABI,
};
