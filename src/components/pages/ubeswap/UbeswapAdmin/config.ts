const WEIGHTS = [
  // ALWAYS ZERO OUT THE WEIGHTS
  // ["cETH-mcUSD", 0],
  // ["mcUSD-cBTC", 0],
  // ["DAI-CELO", 0],
  // ["USDT-CELO", 0],

  // ["CELO-mcUSDxOLD", 0],
  // ["CELO-mcEURxOLD", 0],
  // ["mcUSDxOLD-mcEURxOLD", 0],
  // ["MOO-mCELOxOLD", 0],
  // ["sCELO-CELO", 0],

  ["UBE-CELO", 0.35],
  ["CELO-mcUSD", 0.12],
  ["mcUSD-mcEUR", 0.07],
  ["CELO-mcEUR", 0.05],
  ["MOBI-CELO", 0.04],
  ["WETH-CELO", 0.04],
  ["MOO-mCELO", 0.03],
  ["WBTC-CELO", 0.03],
  ["USDC-CELO", 0.03],
  ["WETH-mcUSD", 0.03],
  ["rCELO-CELO", 0.02],
  ["POOF-UBE", 0.02],
  ["SOL-CELO", 0.02],
  ["UBE-SBR", 0.02],
  ["WBTC-mcUSD", 0.02],
  ["KNX-CELO", 0.015],
  ["POOF-pCELO", 0.01],
  ["mcUSD-AAVE", 0.01],
  ["mcUSD-CRV", 0.01],
  ["mcUSD-SUSHI", 0.01],
  ["mcUSD-BNB", 0.01],
  ["mcUSD-FTM", 0.01],
  ["mcUSD-AVAX", 0.01],
  ["mcUSD-WMATIC", 0.01],
  ["UBE-TFBX", 0.01],
  ["UBE-cMCO2", 0.005],
] as const;

const POOL_ADDRESSES = {
  // "cETH-mcUSD": "0xb5108b01280f994e67dc8bc3cd1e2433fa3a1b41",
  // "mcUSD-cBTC": "0x83CF02F79Be87A7402A3Cac013d0e1C95FeFcAba",
  // "DAI-CELO": "0xe81e989deea15646c9305053b6adbe13b1446d71",
  // "USDT-CELO": "0x2967f068a981e597bedf3cf746fe7476bb6fcb90",

  "CELO-mcUSDxOLD": "0xf5b1bc6c9c180b64f5711567b1d6a51a350f8422",
  "CELO-mcEURxOLD": "0x427c95a1379182121791cc415125acd73ea02e97",
  "mcUSDxOLD-mcEURxOLD": "0x27616d3dba43f55279726c422daf644bc60128a8",
  "MOO-mCELOxOLD": "0x69d5646e63C7cE63171F76EBA89348b52c1D552c",

  "UBE-CELO": "0xe7b5ad135fa22678f426a381c7748f6a5f2c9e6c",
  "POOF-UBE": "0x573bcebd09ff805ed32df2cb1a968418dc74dcf7",
  "POOF-pCELO": "0x993B0d1A2C7EFF889F7e4dDC9a03b5085A2D1f27",
  "CELO-mcUSD": "0xb460F9Ae1fEa4f77107146C1960bb1C978118816",
  "CELO-mcEUR": "0x9f437509E61896738ea8CDb6cDeD618C0e509032",
  "mcUSD-mcEUR": "0xF94fEA0C87D2b357DC72b743b45A8cB682b0716E",
  "MOO-mCELO": "0x9272388FDf2D6bFbA8b1Cdd99732A3D552a71346",
  "rCELO-CELO": "0x58fff7110e39c733fd37742b8850f9205fbc351b",
  "UBE-cMCO2": "0x148c4ce0019a2e53f63df50a6d9e9c09c5969629",
  "sCELO-CELO": "0xa813bb1df70128d629f1a41830578fa616daeeec",
  "MOBI-CELO": "0x0b81cf47c8f97275d14c006e537d5101b6c87300",
  "WBTC-CELO": "0x9f3574dae1aeffd65ef739e9f50e2b9dd8831056",
  "WETH-CELO": "0xae9a62f50171b3e1c4b3345d3638764ecf1a78a6",
  "USDC-CELO": "0x684da04524b1a6baf99566d722de94ce989ea722",
  "UBE-SBR": "0x218aed024d51ecbd6a82d143be04cd25d563628e",
  "SOL-CELO": "0x01522c42ca43d7bfd34f373d41ad7d90a95e714c",
  "KNX-CELO": "0x806e181798465edf56c66e29e2df01caf4013f76",
  "WBTC-mcUSD": "0x724ff4aaFA4fd2C44a1726707C2f1b3d1650Eab9",
  "WETH-mcUSD": "0xF105Df1aCdd02C10818C1F61DE64D0b65d161F5B",
  "mcUSD-AAVE": "0xf35e9ca7ad819a748f678c6bd23a4987287c713c",
  "mcUSD-CRV": "0xda36a59ea2d8e5a4de21fb153b8ded5a62bad9d1",
  "mcUSD-SUSHI": "0x736fc67f144e208381b85dd0898fa1a6677bc437",

  "mcUSD-FTM": "0x11A0DCe6931528fa45E5E34D79C2761Cc8b96169",
  "mcUSD-AVAX": "0x11Ce57AaAE0418d120e4415691B6F174219e4b02",
  "mcUSD-WMATIC": "0xaA2cD92f13c5bA72291b3fDa9D0D860Aa48A514a",
  "mcUSD-BNB": "0x30F1639B42E5F14c176E47d07199F001F122238c",
  "UBE-TFBX": "0x911923b25c6ca2b916da8005f0554b365d7ddf33",
} as const;

export const POOL_WEIGHTS: { name: string; address: string; weight: number }[] =
  WEIGHTS.map(([name, w]) => ({
    name,
    address: POOL_ADDRESSES[name],
    weight: Math.floor(w * 10_000),
  }));

export const MINING_RELEASE_ESCROW =
  "0x9d0a92AA8832518328D14Ed5930eC6B44448165e";
