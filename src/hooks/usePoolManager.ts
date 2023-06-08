import { useEffect, useState } from "react";

import {
  ERC20__factory,
  IUniswapV2Pair__factory,
  PoolManager,
  PoolManager__factory,
} from "../generated";
import { useProviderOrSigner } from "./useProviderOrSigner";

const POOL_MANAGER_ADDRESS = "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2";

interface LPInfo {
  token0: string;
  token0Symbol: string;
  token1: string;
  token1Symbol: string;
}

interface PoolInfo extends LPInfo {
  index: number;
  stakingToken: string;
  poolAddress: string;
  weight: number;
  nextPeriod: number;
}

export const usePoolManager = (): {
  poolManager: PoolManager;
  poolAddresses: readonly string[];
  poolInfo: Record<string, PoolInfo>;
  operator: string | null;
  owner: string | null;
} => {
  const provider = useProviderOrSigner();
  const [thePoolManager, setPoolManager] = useState<PoolManager>(
    PoolManager__factory.connect(POOL_MANAGER_ADDRESS, provider)
  );
  const [poolAddresses, setPoolAddresses] = useState<readonly string[]>([]);
  const [operator, setOperator] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [poolInfo, setPoolInfo] = useState<Record<string, PoolInfo>>({});

  useEffect(() => {
    const poolManager = PoolManager__factory.connect(
      POOL_MANAGER_ADDRESS,
      provider
    );
    void (async () => {
      const count = await poolManager.poolsCount();
      const inputs = await Promise.all(
        Array(count.toNumber())
          .fill(null)
          .map((_, i) => poolManager.poolsByIndex(i))
      );
      setPoolAddresses(inputs);

      const pools = await Promise.all(
        inputs.map((input) => poolManager.pools(input))
      );

      const poolInfo: Record<string, PoolInfo> = {};
      const lpInfo: LPInfo[] = [];
      for (let i = 0; i < pools.length; i++) {
        const p = pools[i]!;
        const cached = cachedLPInfo[p.index.toNumber()];
        if (cached) {
          lpInfo.push(cached);
          continue;
        }
        const lpToken = IUniswapV2Pair__factory.connect(
          p.stakingToken,
          provider
        );
        const token0 = await lpToken.token0();
        const token1 = await lpToken.token1();
        const [token0Symbol, token1Symbol] = await Promise.all([
          ERC20__factory.connect(token0, provider).symbol(),
          ERC20__factory.connect(token1, provider).symbol(),
        ]);
        lpInfo.push({
          token0: token0,
          token1: token1,
          token0Symbol: token0Symbol,
          token1Symbol: token1Symbol,
        });
        console.log("lpInfo", lpInfo);
      }
      pools.forEach(
        (p, idx) =>
          (poolInfo[p.poolAddress] = {
            ...lpInfo[idx]!,
            index: p.index.toNumber(),
            stakingToken: p.stakingToken,
            poolAddress: p.poolAddress,
            weight: p.weight.toNumber(),
            nextPeriod: p.nextPeriod.toNumber(),
          })
      );
      setPoolInfo(poolInfo);

      setOperator(await poolManager.operator());
      setOwner(await poolManager.owner());
      setPoolManager(thePoolManager);
    })();
  }, [thePoolManager, provider]);
  return {
    poolManager: thePoolManager,
    poolAddresses,
    poolInfo,
    operator,
    owner,
  };
};

const cachedLPInfo: LPInfo[] = [
  {
    token0: "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC",
    token1: "0xa8d0E6799FF3Fd19c6459bf02689aE09c4d78Ba7",
    token0Symbol: "UBE",
    token1Symbol: "mCEUR",
  },
  {
    token0: "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC",
    token1: "0x64dEFa3544c695db8c535D289d843a189aa26b98",
    token0Symbol: "UBE",
    token1Symbol: "mCUSD",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0x64dEFa3544c695db8c535D289d843a189aa26b98",
    token0Symbol: "CELO",
    token1Symbol: "mCUSD",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xa8d0E6799FF3Fd19c6459bf02689aE09c4d78Ba7",
    token0Symbol: "CELO",
    token1Symbol: "mCEUR",
  },
  {
    token0: "0x64dEFa3544c695db8c535D289d843a189aa26b98",
    token1: "0xa8d0E6799FF3Fd19c6459bf02689aE09c4d78Ba7",
    token0Symbol: "mCUSD",
    token1Symbol: "mCEUR",
  },
  {
    token0: "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC",
    token1: "0x32A9FE697a32135BFd313a6Ac28792DaE4D9979d",
    token0Symbol: "UBE",
    token1Symbol: "cMCO2",
  },
  {
    token0: "0x32A9FE697a32135BFd313a6Ac28792DaE4D9979d",
    token1: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    token0Symbol: "cMCO2",
    token1Symbol: "cUSD",
  },
  {
    token0: "0x2879BFD5e7c4EF331384E908aaA3Bd3014b703fA",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "sCELO",
    token1Symbol: "CELO",
  },
  {
    token0: "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "UBE",
    token1Symbol: "CELO",
  },
  {
    token0: "0x64dEFa3544c695db8c535D289d843a189aa26b98",
    token1: "0xD629eb00dEced2a080B7EC630eF6aC117e614f1b",
    token0Symbol: "mCUSD",
    token1Symbol: "BTC",
  },
  {
    token0: "0x00400FcbF0816bebB94654259de7273f4A05c762",
    token1: "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC",
    token0Symbol: "POOF",
    token1Symbol: "UBE",
  },
  {
    token0: "0x1a8Dbe5958c597a744Ba51763AbEBD3355996c3e",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "rCELO",
    token1Symbol: "CELO",
  },
  {
    token0: "0x2DEf4285787d58a2f811AF24755A8150622f4361",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "cETH",
    token1Symbol: "CELO",
  },
  {
    token0: "0x2DEf4285787d58a2f811AF24755A8150622f4361",
    token1: "0x64dEFa3544c695db8c535D289d843a189aa26b98",
    token0Symbol: "cETH",
    token1Symbol: "mCUSD",
  },
  {
    token0: "0x17700282592D6917F6A73D0bF8AcCf4D578c131e",
    token1: "0x7037F7296B2fc7908de7b57a89efaa8319f0C500",
    token0Symbol: "MOO",
    token1Symbol: "mCELO",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B",
    token0Symbol: "CELO",
    token1Symbol: "MOBI",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE",
    token0Symbol: "CELO",
    token1Symbol: "WBTC",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4",
    token0Symbol: "CELO",
    token1Symbol: "WETH",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xE4fE50cdD716522A56204352f00AA110F731932d",
    token0Symbol: "CELO",
    token1Symbol: "DAI",
  },
  {
    token0: "0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "USDC",
    token1Symbol: "CELO",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xb020D981420744F6b0FedD22bB67cd37Ce18a1d5",
    token0Symbol: "CELO",
    token1Symbol: "USDT",
  },
  {
    token0: "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC",
    token1: "0x47264aE1Fc0c8e6418ebe78630718E11a07346A8",
    token0Symbol: "UBE",
    token1Symbol: "SBR",
  },
  {
    token0: "0x173234922eB27d5138c5e481be9dF5261fAeD450",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "SOL",
    token1Symbol: "CELO",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xa81D9a2d29373777E4082d588958678a6Df5645c",
    token0Symbol: "CELO",
    token1Symbol: "KNX",
  },
  {
    token0: "0x00400FcbF0816bebB94654259de7273f4A05c762",
    token1: "0xE74AbF23E1Fdf7ACbec2F3a30a772eF77f1601E1",
    token0Symbol: "POOF",
    token1Symbol: "pCELO",
  },
  {
    token0: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token1: "0xE273Ad7ee11dCfAA87383aD5977EE1504aC07568",
    token0Symbol: "mcUSD",
    token1Symbol: "mCEUR",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xE273Ad7ee11dCfAA87383aD5977EE1504aC07568",
    token0Symbol: "CELO",
    token1Symbol: "mCEUR",
  },
  {
    token0: "0x17700282592D6917F6A73D0bF8AcCf4D578c131e",
    token1: "0x7D00cd74FF385c955EA3d79e47BF06bD7386387D",
    token0Symbol: "MOO",
    token1Symbol: "mCELO",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "CELO",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token1: "0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE",
    token0Symbol: "mcUSD",
    token1Symbol: "WBTC",
  },
  {
    token0: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token1: "0xD15EC721C2A896512Ad29C671997DD68f9593226",
    token0Symbol: "mcUSD",
    token1Symbol: "SUSHI",
  },
  {
    token0: "0x0a7432cF27F1aE3825c313F3C81e7D3efD7639aB",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "CRV",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token1: "0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4",
    token0Symbol: "mcUSD",
    token1Symbol: "WETH",
  },
  {
    token0: "0x503681c68f03bbbCe48005DCD7b83ae8D4fD745C",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "AAVE",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x218c3c3D49d0E7B37aff0D8bB079de36Ae61A4c0",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "FTM",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x8E3670FD7B0935d3FE832711deBFE13BB689b690",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "AVAX",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC",
    token1: "0x035eE610693a29Cb77fD6eFBEb9d9d278703e145",
    token0Symbol: "UBE",
    token1Symbol: "TFBX",
  },
  {
    token0: "0x3aF556B48469D2398AB7BE1563a0cfd80ea4aC84",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "WMATIC",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token1: "0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F",
    token0Symbol: "mcUSD",
    token1Symbol: "BNB",
  },
  {
    token0: "0x0a60c25Ef6021fC3B479914E6bcA7C03c18A97f1",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "stabilUSD",
    token1Symbol: "CELO",
  },
  {
    token0: "0x74c0C58B99b68cF16A717279AC2d056A34ba2bFe",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "SOURCE",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x122013fd7dF1C6F636a5bb8f03108E876548b455",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "WETH",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token1: "0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B",
    token0Symbol: "mcUSD",
    token1Symbol: "WBTC",
  },
  {
    token0: "0x20677d4f3d0F08e735aB512393524A3CfCEb250C",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "ARI",
    token1Symbol: "CELO",
  },
  {
    token0: "0x00400FcbF0816bebB94654259de7273f4A05c762",
    token1: "0x301a61D01A63c8D670c2B8a43f37d12eF181F997",
    token0Symbol: "POOF",
    token1Symbol: "pCELO",
  },
  {
    token0: "0x46c9757C5497c5B1f2eb73aE79b6B67D119B0B58",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "PACT",
    token1Symbol: "CELO",
  },
  {
    token0: "0x2E3487F967DF2Ebc2f236E16f8fCAeac7091324D",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "WMATIC",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token1: "0xE685d21b7B0FC7A248a6A8E03b8Db22d013Aa2eE",
    token0Symbol: "mcUSD",
    token1Symbol: "IMMO",
  },
  {
    token0: "0x32A9FE697a32135BFd313a6Ac28792DaE4D9979d",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "cMCO2",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x6e512BFC33be36F2666754E996ff103AD1680Cc9",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "ABR",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0x9802d866fdE4563d088a6619F7CeF82C0B991A55",
    token0Symbol: "CELO",
    token1Symbol: "mCREAL",
  },
  {
    token0: "0x3D3B92Fe0B4c26b74F8fF13A32dD764F4DFD8b51",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "oKSP",
    token1Symbol: "CELO",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xbDd31EFfb9E9f7509fEaAc5B4091b31645A47e4b",
    token0Symbol: "CELO",
    token1Symbol: "TFBX",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0x8427bD503dd3169cCC9aFF7326c15258Bc305478",
    token0Symbol: "CELO",
    token1Symbol: "SYMM",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xA287A3722c367849eFA5c76e96BE36efd65C290e",
    token0Symbol: "CELO",
    token1Symbol: "cDEFI",
  },
  {
    token0: "0x00400FcbF0816bebB94654259de7273f4A05c762",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "POOF",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207",
    token0Symbol: "CELO",
    token1Symbol: "WETH",
  },
  {
    token0: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    token1: "0x9995cc8F20Db5896943Afc8eE0ba463259c931ed",
    token0Symbol: "cUSD",
    token1Symbol: "ETHIX",
  },
  {
    token0: "0x02De4766C272abc10Bc88c220D214A26960a7e92",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "NCT",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    token0Symbol: "CELO",
    token1Symbol: "cUSD",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
    token0Symbol: "CELO",
    token1Symbol: "cEUR",
  },
  {
    token0: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token1: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
    token0Symbol: "CELO",
    token1Symbol: "cREAL",
  },
  {
    token0: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    token1: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
    token0Symbol: "cUSD",
    token1Symbol: "cEUR",
  },
  {
    token0: "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A",
    token1: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
    token0Symbol: "G$",
    token1Symbol: "mcUSD",
  },
  {
    token0: "0x27cd006548dF7C8c8e9fdc4A67fa05C2E3CA5CF9",
    token1: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    token0Symbol: "PLASTIK",
    token1Symbol: "CELO",
  },
];
