import {
  useGetConnectedSigner,
  useProvider,
} from "@celo-tools/use-contractkit";
import { ethers } from "ethers";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Box, Button, Card, Flex, Heading, Link, Text } from "theme-ui";
import Web3 from "web3";
import { AbiItem, fromWei, toWei } from "web3-utils";

import ERC20Abi from "../../../abis/ERC20.json";
import MSRAbi from "../../../abis/MoolaStakingRewards.json";
import { Address } from "../../../components/common/Address";
import {
  ERC20__factory,
  FarmRegistry__factory,
  IUniswapV2Pair__factory,
  MoolaStakingRewards__factory,
  MultiSig as MultisigContract,
} from "../../../generated";
import { useAsyncState } from "../../../hooks/useAsyncState";
import { useMultisigContract } from "../../../hooks/useMultisigContract";
import { FARM_REGISTRY_ADDRESS } from "../../../hooks/useRegisteredFarms";

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
  CELOUSD = "CELO-mcUSD",
  CELOEUR = "CELO-mcEUR",
  CELOUBE = "UBE-CELO",
  CELORCELO = "rCELO-CELO",
  WBTCMCUSD = "WBTC-mcUSD",
  WETHMCUSD = "WETH-mcUSD",
  SUSHIMCUSD = "SUSHI-mcUSD",
  CRVMCUSD = "CRV-mcUSD",
  AAVEMCUSD = "AAVE-mcUSD",
  FTMMCUSD = "FTM-mcUSD",
  AVAXMCUSD = "AVAX-mcUSD",
  WMATICMCUSD = "WMATIC-mcUSD",
  BNBMCUSD = "BNB-mcUSD",
  SOLCELO = "SOL-CELO",
  UBE = "UBE",

  // Poof controlled
  POOFUBE = "POOF-UBE",
  PCELOPOOF = "pCELO-POOF",
  pUSDUSD = "pUSD-USDC-cUSD",
  pEUREUR = "pEUR-cEUR",
  pCELOCELO = "pCELO-CELO",
}

enum Token {
  CELO = "0x471ece3750da237f93b8e339c536989b8978a438",
  POOF = "0x00400fcbf0816bebb94654259de7273f4a05c762",
  UBE = "0x00be915b9dcf56a3cbe739d9b9c202ca692409ec",
}

enum Multisig {
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

const Rewards: React.FC = () => {
  const router = useRouter();
  const { address: farmAddress } = router.query;
  const provider = useProvider();
  const [farm, setFarm] = useState<Farm>();
  useEffect(() => {
    if (!farmAddress) {
      return;
    }
    const fn = async () => {
      const msr = MoolaStakingRewards__factory.connect(
        farmAddress.toString(),
        provider
      );
      const stakingToken = IUniswapV2Pair__factory.connect(
        await msr.stakingToken(),
        provider
      );
      const token0Symbol = await ERC20__factory.connect(
        await stakingToken.token0(),
        provider
      ).symbol();
      const token1Symbol = await ERC20__factory.connect(
        await stakingToken.token1(),
        provider
      ).symbol();
      setFarm({
        farmAddress: farmAddress.toString(),
        farmName: `${token0Symbol}-${token1Symbol}`,
        rewardToken: await msr.rewardsToken(),
        manager: await msr.rewardsDistribution(),
      });
    };
    void fn();
  }, [farmAddress, provider]);

  const getConnectedSigner = useGetConnectedSigner();
  const sendRewards = React.useCallback(
    async (farm: Farm, amount: string) => {
      const signer = await getConnectedSigner();
      const token = ERC20__factory.connect(farm.rewardToken, signer);
      await token.transfer(farm.farmAddress, amount);
    },
    [getConnectedSigner]
  );
  const notify = React.useCallback(
    async (farm: Farm, amount: string) => {
      const signer = await getConnectedSigner();
      const msr = MoolaStakingRewards__factory.connect(
        farm.farmAddress,
        signer
      );
      await msr.notifyRewardAmount(amount);
    },
    [getConnectedSigner]
  );
  const lookupCall = React.useCallback(async () => {
    if (!farm) return;
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
      lastReward,
    ] = await Promise.all([
      farmContract.periodFinish(),
      farmContract.rewardRate(),
      rewardToken.balanceOf(farm.farmAddress),
      farmContract.stakingToken(),
      farmContract.owner(),
      farmContract.rewardsDistribution(),
      farmContract
        .queryFilter(farmContract.filters.RewardAdded(null))
        .then((events) => events.reverse()[0]?.args.reward),
    ]);
    return {
      periodEnd: Number(periodEnd),
      rewardRate: Number(fromWei(rewardRate.toString())) * SECONDS_PER_WEEK,
      rewardBalance: Number(fromWei(balance.toString())),
      stakingToken,
      owner,
      rewardsDistribution,
      lastReward: lastReward?.toString() || "0",
    };
  }, [farm, provider]);
  const [lookup, refetchLookup] = useAsyncState(null, lookupCall);
  const refresh = () => {
    refetchLookup();
  };

  return (
    <div>
      <Heading as="h2" mb={2}>
        Multi reward pools
      </Heading>
      {farm && lookup && (
        <Card mb={2}>
          <Flex sx={{ alignItems: "center" }}>
            <Heading as="h3">
              <Address value={farm.farmAddress} label={farm.farmName} />
            </Heading>
            <Link ml={2} onClick={refresh}>
              Reload
            </Link>
          </Flex>
          <div>
            {lookup.periodEnd && (
              <Text sx={{ display: "block" }}>
                Period end:{" "}
                {moment
                  .unix(lookup.periodEnd)
                  .format("dddd, MMMM Do YYYY, h:mm:ss a")}
              </Text>
            )}
            {lookup.rewardRate && (
              <Text sx={{ display: "block" }}>
                Rewards per week: {lookup.rewardRate}{" "}
                {tokenName[farm.rewardToken]}
              </Text>
            )}
            {lookup.rewardBalance && (
              <Text sx={{ display: "block" }}>
                Farm balance: {lookup.rewardBalance}{" "}
                {tokenName[farm.rewardToken]}
              </Text>
            )}
            {lookup.stakingToken && (
              <Text sx={{ display: "block" }}>
                Staking token address:{" "}
                <Address value={lookup.stakingToken.toString()} />
              </Text>
            )}
            {lookup.owner && (
              <Text sx={{ display: "block" }}>
                Owner address: <Address value={lookup.owner.toString()} />
              </Text>
            )}
            {lookup.rewardsDistribution && (
              <Text sx={{ display: "block" }}>
                Rewards distribution address:{" "}
                <Address value={lookup.rewardsDistribution.toString()} />
              </Text>
            )}
          </div>
          <Box mt={2}>
            <Button
              onClick={() => {
                void sendRewards(farm, lookup.lastReward);
                refresh();
              }}
              mr={1}
            >
              Transfer {fromWei(lookup.lastReward)}{" "}
              {tokenName[farm.rewardToken]}
            </Button>
            <Button
              onClick={() => {
                void notify(farm, lookup.lastReward);
                refresh();
              }}
              mr={1}
            >
              Notify {fromWei(lookup.lastReward)} {tokenName[farm.rewardToken]}
            </Button>
            <Button
              onClick={() => {
                const amount = prompt(
                  `Enter amount of ${tokenName[farm.rewardToken]} to transfer`
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
                  `Enter amount of ${tokenName[farm.rewardToken]} to notify`
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
      )}
    </div>
  );
};

export default Rewards;
