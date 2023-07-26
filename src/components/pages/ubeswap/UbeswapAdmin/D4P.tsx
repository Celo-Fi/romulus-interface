/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber, ethers } from "ethers";
import moment from "moment";
import React, { useEffect } from "react";
import { Box, Button, Card, Flex, Heading, Link, Text } from "theme-ui";
import Web3 from "web3";
import { AbiItem, fromWei, toWei } from "web3-utils";

import ERC20Abi from "../../../../abis/ERC20.json";
import MSRAbi from "../../../../abis/MoolaStakingRewards.json";
import { Address } from "../../../../components/common/Address";
import {
  ERC20__factory,
  FarmRegistry__factory,
  MoolaStakingRewards__factory,
  Multicall__factory,
  MultiSig as MultisigContract,
} from "../../../../generated";
import { useAsyncState } from "../../../../hooks/useAsyncState";
import { useGetConnectedSigner } from "../../../../hooks/useGetConnectedSigner";
import { useMultisigContract } from "../../../../hooks/useMultisigContract";
import { useProvider } from "../../../../hooks/useProvider";
import { FARM_REGISTRY_ADDRESS } from "../../../../hooks/useRegisteredFarms";

const web3 = new Web3("https://forno.celo.org"); // TODO: HARDCODE

// == UTILS ==
const transferInterface = ERC20Abi.find((f) => f.name === "transfer");
const getTransferData = (recipient: string, amount: string) =>
  transferInterface
    ? web3.eth.abi.encodeFunctionCall(transferInterface as AbiItem, [
        recipient,
        amount,
      ])
    : null;
const notifyInterface = MSRAbi.find((f) => f.name === "notifyRewardAmount");
const getNotifyData = (amount: string) =>
  notifyInterface
    ? web3.eth.abi.encodeFunctionCall(notifyInterface as AbiItem, [amount])
    : null;

// == TYPES ==
enum Pool {
  // Ubeswap controlled
  // CELOUSD = "CELO-mcUSD",
  // CELOEUR = "CELO-mcEUR",
  // CELOUBE = "UBE-CELO",
  // CELORCELO = "rCELO-CELO",
  // WBTCMCUSD = "WBTC-mcUSD",
  // WETHMCUSD = "WETH-mcUSD",
  // SUSHIMCUSD = "SUSHI-mcUSD",
  // CRVMCUSD = "CRV-mcUSD",
  // AAVEMCUSD = "AAVE-mcUSD",
  // FTMMCUSD = "FTM-mcUSD",
  // AVAXMCUSD = "AVAX-mcUSD",
  // WMATICMCUSD = "WMATIC-mcUSD",
  // BNBMCUSD = "BNB-mcUSD",
  // SOLCELO = "SOL-CELO",
  UBE = "UBE",

  // Poof controlled
  // POOFUBE = "POOF-UBE",
  // PCELOPOOF = "pCELO-POOF",
  // pUSDUSD = "pUSD-cUSD",
  // pEUREUR = "pEUR-cEUR",
  // pCELOCELO = "pCELO-CELO",
}

enum Token {
  CELO = "0x471ece3750da237f93b8e339c536989b8978a438",
  POOF = "0x00400fcbf0816bebb94654259de7273f4a05c762",
  UBE = "0x00be915b9dcf56a3cbe739d9b9c202ca692409ec",
}

export enum D4PMultisig {
  UBE = "0x0Ce41DbCEA62580Ae2C894a7D93E97da0c3daC3a",
  POOF = "0x54c18437bC09Ee60BCd40aFe7E560010860fFC1F",
}

type Farm = {
  farmAddress: string;
  farmName: string;
  rewardToken: string;
  manager: string;
};

type FarmLookup = Record<
  string,
  {
    periodEnd: number;
    rewardRate: number;
    rewardBalance: number;
    stakingToken: string;
    owner: string;
    rewardsDistribution: string;
    lastReward: string;
  }
>;

// == CONSTANTS ==
const SECONDS_PER_WEEK = 60 * 60 * 24 * 7;
const tokenName: Record<string, string> = {
  [Token.CELO]: "CELO",
  [Token.POOF]: "POOF",
  [Token.UBE]: "UBE",
};

export const extraFarms: Farm[] = [
  {
    farmAddress: "0xCe74d14163deb82af57f253108F7E5699e62116d",
    farmName: "UBE Single Staking",
    rewardToken: Token.UBE,
    manager: D4PMultisig.UBE,
  },
  // {
  //   farmAddress: "0x3A7D1c18618c4f099D2703f8981CEA9c56Ac7779",
  //   farmName: Pool.pUSDUSD,
  //   rewardToken: Token.POOF,
  //   manager: D4PMultisig.POOF,
  // },
  // {
  //   farmAddress: "0xA1e9175ad10fBdA9Fa042269c2AB7DaFB54dc164",
  //   farmName: Pool.pEUREUR,
  //   rewardToken: Token.POOF,
  //   manager: D4PMultisig.POOF,
  // },
  // {
  //   farmAddress: "0xb86e373b209fb2C4cbE17d68d52A59798E4A9640",
  //   farmName: Pool.pCELOCELO,
  //   rewardToken: Token.POOF,
  //   manager: D4PMultisig.POOF,
  // },
  // {
  //   farmAddress: "0x9925664eF3D300BaAe432C9c04752C8196AF7123",
  //   farmName: Pool.pUSDUSD,
  //   rewardToken: Token.POOF,
  //   manager: D4PMultisig.POOF,
  // },
  // {
  //   farmAddress: "0xc4e422ED8939697897443caa4e70E933cD001f54",
  //   farmName: Pool.pEUREUR,
  //   rewardToken: Token.POOF,
  //   manager: D4PMultisig.POOF,
  // },
  // {
  //   farmAddress: "0xa8E2ec31760Df07108c849f321e6872d15d12017",
  //   farmName: Pool.pCELOCELO,
  //   rewardToken: Token.POOF,
  //   manager: D4PMultisig.POOF,
  // },
];

interface Props {
  manager: D4PMultisig;
}

export const D4P: React.FC<Props> = ({ manager }) => {
  const ubeswapMultisig = useMultisigContract(D4PMultisig.UBE);
  const poofMultisig = useMultisigContract(D4PMultisig.POOF);
  const provider = useProvider();
  const farms = extraFarms;
  const multisigLookup: Record<string, MultisigContract> = React.useMemo(
    () => ({
      [D4PMultisig.UBE]: ubeswapMultisig,
      [D4PMultisig.POOF]: poofMultisig,
    }),
    [ubeswapMultisig, poofMultisig]
  );
  useEffect(() => {
    // const farmRegistry = FarmRegistry__factory.connect(
    //   FARM_REGISTRY_ADDRESS,
    //   provider
    // );
    // void farmRegistry
    //   .queryFilter(farmRegistry.filters.FarmInfo(null, null, null))
    //   .then(async (events) => {
    //     const farms = (
    //       await Promise.all(
    //         events.map(async (event) => {
    //           const msr = MoolaStakingRewards__factory.connect(
    //             event.args[0],
    //             provider
    //           );
    //           return {
    //             farmAddress: event.args[0],
    //             farmName: ethers.utils.parseBytes32String(event.args[1]),
    //             rewardToken: await msr.rewardsToken(),
    //             manager: await msr.rewardsDistribution(),
    //           };
    //         })
    //       )
    //     )
    //       .filter((farm) => multisigLookup[farm.manager] != null)
    //       .sort((a, b) => a.manager.localeCompare(b.manager));
    //     setFarms(
    //       [...farms, ...extraFarms].filter((f) => f.manager === manager)
    //     );
    //   });
  }, [manager, multisigLookup, provider]);

  const getConnectedSigner = useGetConnectedSigner();
  const sendRewards = React.useCallback(
    async (farm: Farm, amount: string) => {
      const signer = await getConnectedSigner();
      const data = getTransferData(farm.farmAddress, amount);
      if (data) {
        await multisigLookup[farm.manager]
          ?.connect(signer)
          .submitTransaction(farm.rewardToken, 0, data);
      }
    },
    [multisigLookup, getConnectedSigner]
  );
  const notify = React.useCallback(
    async (farm: Farm, amount: string) => {
      const signer = await getConnectedSigner();
      const data = getNotifyData(amount);
      if (data) {
        await multisigLookup[farm.manager]
          ?.connect(signer)
          .submitTransaction(farm.farmAddress, 0, data);
      }
    },
    [multisigLookup, getConnectedSigner]
  );
  const lookupCall = React.useCallback(async () => {
    const lookup: FarmLookup = {};
    const multicall = Multicall__factory.connect(
      "0xa27A0C40A0a17485c11d1f342a95c946E9523551",
      provider
    );
    await Promise.all(
      farms.map(async (farm) => {
        const farmContract = MoolaStakingRewards__factory.connect(
          farm.farmAddress,
          provider
        );
        const rewardToken = ERC20__factory.connect(farm.rewardToken, provider);
        const [
          periodEnd,
          rewardRate,
          balance,
          stakingToken,
          owner,
          rewardsDistribution,
        ] = await multicall.callStatic
          .aggregate([
            {
              target: farmContract.address,
              callData:
                farmContract.interface.encodeFunctionData("periodFinish"),
            },
            {
              target: farmContract.address,
              callData: farmContract.interface.encodeFunctionData("rewardRate"),
            },
            {
              target: rewardToken.address,
              callData: rewardToken.interface.encodeFunctionData("balanceOf", [
                farm.farmAddress,
              ]),
            },
            {
              target: farmContract.address,
              callData:
                farmContract.interface.encodeFunctionData("stakingToken"),
            },
            {
              target: farmContract.address,
              callData: farmContract.interface.encodeFunctionData("owner"),
            },
            {
              target: farmContract.address,
              callData: farmContract.interface.encodeFunctionData(
                "rewardsDistribution"
              ),
            },
          ])
          .then(({ returnData }) => [
            farmContract.interface.decodeFunctionResult(
              "periodFinish",
              returnData[0]!
            ),
            farmContract.interface.decodeFunctionResult(
              "rewardRate",
              returnData[1]!
            ),
            rewardToken.interface.decodeFunctionResult(
              "balanceOf",
              returnData[2]!
            ),
            farmContract.interface.decodeFunctionResult(
              "stakingToken",
              returnData[3]!
            )[0] as unknown as string,
            farmContract.interface.decodeFunctionResult(
              "owner",
              returnData[4]!
            )[0] as unknown as string,
            farmContract.interface.decodeFunctionResult(
              "rewardsDistribution",
              returnData[5]!
            )[0] as unknown as string,
          ]);
        lookup[farm.farmAddress] = {
          periodEnd: Number(periodEnd),
          rewardRate:
            Number(fromWei(rewardRate!.toString())) * SECONDS_PER_WEEK,
          rewardBalance: Number(fromWei(balance!.toString())),
          stakingToken: stakingToken as unknown as string,
          owner: owner as unknown as string,
          rewardsDistribution: rewardsDistribution as unknown as string,
          lastReward: BigNumber.from(rewardRate!.toString())
            .mul(SECONDS_PER_WEEK)
            .toString(),
        };
      })
    );
    return lookup;
  }, [farms, provider]);
  const [lookup, refetchLookup] = useAsyncState(null, lookupCall);

  return (
    <div>
      <Heading as="h2" mb={2}>
        Multi reward pools
      </Heading>
      {farms.map((farm, idx) => {
        const data = lookup?.[farm.farmAddress];
        if (data == null || !farm.rewardToken) {
          return null;
        }

        const {
          periodEnd,
          rewardRate,
          rewardBalance,
          stakingToken,
          owner,
          rewardsDistribution,
          lastReward,
        } = data;

        const refresh = () => {
          refetchLookup();
        };

        return (
          <Card key={idx} mb={2}>
            <Flex sx={{ alignItems: "center" }}>
              <Heading as="h3">
                <Address value={farm.farmAddress} label={farm.farmName} />
              </Heading>
              <Link ml={2} onClick={refresh}>
                Reload
              </Link>
            </Flex>
            <div>
              {periodEnd && (
                <Text sx={{ display: "block" }}>
                  Period end:{" "}
                  {moment
                    .unix(periodEnd)
                    .format("dddd, MMMM Do YYYY, h:mm:ss a")}
                </Text>
              )}
              {rewardRate && (
                <Text sx={{ display: "block" }}>
                  Rewards per week: {rewardRate} {tokenName[farm.rewardToken]}
                </Text>
              )}
              {rewardBalance && (
                <Text sx={{ display: "block" }}>
                  Farm balance: {rewardBalance} {tokenName[farm.rewardToken]}
                </Text>
              )}
              {stakingToken && (
                <Text sx={{ display: "block" }}>
                  Staking token address:{" "}
                  <Address value={stakingToken.toString()} />
                </Text>
              )}
              {owner && (
                <Text sx={{ display: "block" }}>
                  Owner address: <Address value={owner.toString()} />
                </Text>
              )}
              {rewardsDistribution && (
                <Text sx={{ display: "block" }}>
                  Rewards distribution address:{" "}
                  <Address value={rewardsDistribution.toString()} />
                </Text>
              )}
            </div>
            <Box mt={2}>
              <Button
                onClick={() => {
                  void sendRewards(farm, lastReward);
                  refresh();
                }}
                mr={1}
              >
                Transfer {fromWei(lastReward)} {tokenName[farm.rewardToken]}
              </Button>
              <Button
                onClick={() => {
                  void notify(farm, lastReward);
                  refresh();
                }}
                mr={1}
              >
                Notify {fromWei(lastReward)} {tokenName[farm.rewardToken]}
              </Button>
              <Button
                onClick={() => {
                  const amount = prompt(
                    `Enter amount of ${
                      tokenName[farm.rewardToken] ?? "???"
                    } to transfer`
                  );
                  if (!amount) {
                    console.warn("Invalid amount");
                    return;
                  }
                  void sendRewards(farm, toWei(amount));
                  refresh();
                }}
                mr={1}
              >
                Transfer custom {tokenName[farm.rewardToken]}
              </Button>
              <Button
                onClick={() => {
                  const amount = prompt(
                    `Enter amount of ${
                      tokenName[farm.rewardToken] ?? "???"
                    } to notify`
                  );
                  if (!amount) {
                    console.warn("Invalid amount");
                    return;
                  }
                  void notify(farm, toWei(amount));
                  refresh();
                }}
                mr={2}
              >
                Notify custom {tokenName[farm.rewardToken]}
              </Button>
            </Box>
          </Card>
        );
      })}
    </div>
  );
};
