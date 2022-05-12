import { ethers, Signer } from "ethers";
import moment from "moment";
import React, { useEffect } from "react";
import { Box, Button, Card, Flex, Heading, Link, Text } from "theme-ui";
import { fromWei, toWei } from "web3-utils";

import ERC20Abi from "../../../../abis/ERC20.json";
import MSRAbi from "../../../../abis/MoolaStakingRewards.json";
import { Address } from "../../../../components/common/Address";
import {
  ERC20__factory,
  FarmRegistry__factory,
  MoolaStakingRewards__factory,
  MultiSig as MultisigContract,
} from "../../../../generated";
import { useAsyncState } from "../../../../hooks/useAsyncState";
import { useMultisigContract } from "../../../../hooks/useMultisigContract";
import { FARM_REGISTRY_ADDRESS } from "../../../../hooks/useRegisteredFarms";
import { useWeb3Context } from "web3-react";

// == UTILS ==
const transferInterface = JSON.stringify(
  ERC20Abi.find((f) => f.name === "transfer")
);
const getTransferData = (recipient: string, amount: string) =>
  transferInterface
    ? new ethers.utils.Interface(transferInterface).encodeFunctionData(
        "transfer",
        [recipient, amount]
      )
    : null;
const notifyInterface = JSON.stringify(
  MSRAbi.find((f) => f.name === "notifyRewardAmount")
);
const getNotifyData = (amount: string) =>
  notifyInterface
    ? new ethers.utils.Interface(notifyInterface).encodeFunctionData(
        "notifyRewardAmount",
        [amount]
      )
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
  pUSDUSD = "pUSD-cUSD",
  pEUREUR = "pEUR-cEUR",
  pCELOCELO = "pCELO-CELO",
}

enum Token {
  MATIC = "0x0000000000000000000000000000000000001010",
  AUTO = "0x00400fcbf0816bebb94654259de7273f4a05c762",
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
  [Token.MATIC]: "MATIC",
  [Token.AUTO]: "AUTO",
};

export const extraFarms: Farm[] = [];

interface Props {
  manager: D4PMultisig;
}

export const D4P: React.FC<Props> = ({ manager }) => {
  const ubeswapMultisig = useMultisigContract(D4PMultisig.UBE);
  const poofMultisig = useMultisigContract(D4PMultisig.POOF);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { library: ethers } = useWeb3Context();
  const [farms, setFarms] = React.useState<Farm[]>([]);
  const multisigLookup: Record<string, MultisigContract> = React.useMemo(
    () => ({
      [D4PMultisig.UBE]: ubeswapMultisig,
      [D4PMultisig.POOF]: poofMultisig,
    }),
    [ubeswapMultisig, poofMultisig]
  );
  useEffect(() => {
    const farmRegistry = FarmRegistry__factory.connect(
      FARM_REGISTRY_ADDRESS,
      ethers
    );
    void farmRegistry
      .queryFilter(farmRegistry.filters.FarmInfo(null, null, null))
      .then(async (events) => {
        const farms = (
          await Promise.all(
            events.map(async (event) => {
              const msr = MoolaStakingRewards__factory.connect(
                event.args[0],
                ethers
              );
              return {
                farmAddress: event.args[0],
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                farmName: ethers.utils.parseBytes32String(event.args[1]),
                rewardToken: await msr.rewardsToken(),
                manager: await msr.rewardsDistribution(),
              };
            })
          )
        )
          .filter((farm) => multisigLookup[farm.manager] != null)
          .sort((a, b) => a.manager.localeCompare(b.manager));
        setFarms(
          [...farms, ...extraFarms].filter((f) => f.manager === manager)
        );
      });
  }, [multisigLookup, ethers]);

  const sendRewards = React.useCallback(
    async (farm: Farm, amount: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const signer: Signer = await ethers.providers.JsonRpcProvider.getSigner();
      const data = getTransferData(farm.farmAddress, amount);
      if (data) {
        await multisigLookup[farm.manager]
          ?.connect(signer)
          .submitTransaction(farm.rewardToken, 0, data);
      }
    },
    [multisigLookup, ethers]
  );
  const notify = React.useCallback(
    async (farm: Farm, amount: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const signer: Signer = await ethers.providers.JsonRpcProvider.getSigner();
      const data = getNotifyData(amount);
      if (data) {
        await multisigLookup[farm.manager]
          ?.connect(signer)
          .submitTransaction(farm.farmAddress, 0, data);
      }
    },
    [multisigLookup, ethers]
  );
  const lookupCall = React.useCallback(async () => {
    const lookup: FarmLookup = {};
    await Promise.all(
      farms.map(async (farm) => {
        const farmContract = MoolaStakingRewards__factory.connect(
          farm.farmAddress,
          ethers
        );
        const rewardToken = ERC20__factory.connect(farm.rewardToken, ethers);
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
        lookup[farm.farmAddress] = {
          periodEnd: Number(periodEnd),
          rewardRate: Number(fromWei(rewardRate.toString())) * SECONDS_PER_WEEK,
          rewardBalance: Number(fromWei(balance.toString())),
          stakingToken,
          owner,
          rewardsDistribution,
          lastReward: lastReward?.toString() || "0",
        };
      })
    );
    return lookup;
  }, [farms, ethers]);
  const [lookup, refetchLookup] = useAsyncState(null, lookupCall);

  return (
    <div>
      <Heading as="h2" mb={2}>
        Multi reward pools
      </Heading>
      {farms.map((farm, idx) => {
        const data = lookup?.[farm.farmAddress];
        if (data == null) {
          return;
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
        );
      })}
    </div>
  );
};
