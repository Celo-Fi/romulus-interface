const WEIGHTS = [
  ["cETH-mcUSD", 0.125],
  ["mcUSD-cBTC", 0.125],
  ["UBE-CELO", 0.35],
  ["POOF-UBE", 0.05],
  ["CELO-mcUSD", 0.06],
  ["CELO-mcEUR", 0.06],
  ["rCELO-CELO", 0.025],
  ["mcUSD-mcEUR", 0.055],
  ["UBE-cMCO2", 0.025],
  ["MOO-mCELO", 0.1],
  ["sCELO-CELO", 0.025],
] as const;

const POOL_ADDRESSES = {
  "cETH-mcUSD": "0xb5108b01280f994e67dc8bc3cd1e2433fa3a1b41",
  "mcUSD-cBTC": "0x83CF02F79Be87A7402A3Cac013d0e1C95FeFcAba",
  "UBE-CELO": "0xe7b5ad135fa22678f426a381c7748f6a5f2c9e6c",
  "POOF-UBE": "0x573bcebd09ff805ed32df2cb1a968418dc74dcf7",
  "CELO-mcUSD": "0xf5b1bc6c9c180b64f5711567b1d6a51a350f8422",
  "CELO-mcEUR": "0x427c95a1379182121791cc415125acd73ea02e97",
  "rCELO-CELO": "0x58fff7110e39c733fd37742b8850f9205fbc351b",
  "mcUSD-mcEUR": "0x27616d3dba43f55279726c422daf644bc60128a8",
  "UBE-cMCO2": "0x148c4ce0019a2e53f63df50a6d9e9c09c5969629",
  "MOO-mCELO": "0x69d5646e63C7cE63171F76EBA89348b52c1D552c",
  "sCELO-CELO": "0xa813bb1df70128d629f1a41830578fa616daeeec",
} as const;

export const POOL_WEIGHTS: { name: string; address: string; weight: number }[] =
  WEIGHTS.map(([name, w]) => ({
    name,
    address: POOL_ADDRESSES[name],
    weight: w * 10_000,
  }));

export const MINING_RELEASE_ESCROW =
  "0x9d0a92AA8832518328D14Ed5930eC6B44448165e";
