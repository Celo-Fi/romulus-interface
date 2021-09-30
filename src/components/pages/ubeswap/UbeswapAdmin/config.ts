const WEIGHTS = [
  ["UBE-CELO", 0.39],
  ["POOF-UBE", 0.05],
  ["CELO-mcUSD", 0.12],
  ["CELO-mcEUR", 0.06],
  ["rCELO-CELO", 0.01],
  ["mcUSD-mcEUR", 0.055],
  ["UBE-cMCO2", 0.01],
  ["MOO-mCELO", 0.075],
  ["sCELO-CELO", 0.01],
  ["MOBI-CELO", 0.01],

  ["WBTC-CELO", 0.09],
  ["WETH-CELO", 0.09],
  ["DAI-CELO", 0.01],
  ["USDC-CELO", 0.01],
  ["USDT-CELO", 0.01],
] as const;

const POOL_ADDRESSES = {
  "UBE-CELO": "0xe7b5ad135fa22678f426a381c7748f6a5f2c9e6c",
  "POOF-UBE": "0x573bcebd09ff805ed32df2cb1a968418dc74dcf7",
  "CELO-mcUSD": "0xf5b1bc6c9c180b64f5711567b1d6a51a350f8422",
  "CELO-mcEUR": "0x427c95a1379182121791cc415125acd73ea02e97",
  "rCELO-CELO": "0x58fff7110e39c733fd37742b8850f9205fbc351b",
  "mcUSD-mcEUR": "0x27616d3dba43f55279726c422daf644bc60128a8",
  "UBE-cMCO2": "0x148c4ce0019a2e53f63df50a6d9e9c09c5969629",
  "MOO-mCELO": "0x69d5646e63C7cE63171F76EBA89348b52c1D552c",
  "sCELO-CELO": "0xa813bb1df70128d629f1a41830578fa616daeeec",
  "MOBI-CELO": "0x0b81cf47c8f97275d14c006e537d5101b6c87300",
  "WBTC-CELO": "0x9f3574dae1aeffd65ef739e9f50e2b9dd8831056",
  "WETH-CELO": "0xae9a62f50171b3e1c4b3345d3638764ecf1a78a6",
  "DAI-CELO": "0xe81e989deea15646c9305053b6adbe13b1446d71",
  "USDC-CELO": "0x684da04524b1a6baf99566d722de94ce989ea722",
  "USDT-CELO": "0x2967f068a981e597bedf3cf746fe7476bb6fcb90",
} as const;

export const POOL_WEIGHTS: { name: string; address: string; weight: number }[] =
  WEIGHTS.map(([name, w]) => ({
    name,
    address: POOL_ADDRESSES[name],
    weight: w * 10_000,
  }));

export const MINING_RELEASE_ESCROW =
  "0x9d0a92AA8832518328D14Ed5930eC6B44448165e";
