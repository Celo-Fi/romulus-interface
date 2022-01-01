import {
  useGetConnectedSigner,
  useProvider,
} from "@celo-tools/use-contractkit";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Box, Button, Card, Flex, Heading, Link, Text } from "theme-ui";
import { fromWei, toWei } from "web3-utils";

import { Address } from "../../../components/common/Address";
import {
  ERC20__factory,
  IUniswapV2Pair__factory,
  MoolaStakingRewards__factory,
} from "../../../generated";
import { useAsyncState } from "../../../hooks/useAsyncState";

type Farm = {
  farmAddress: string;
  farmName: string;
  rewardToken: string;
  manager: string;
};

// == CONSTANTS ==
const SECONDS_PER_WEEK = 60 * 60 * 24 * 7;

const Rewards: React.FC = () => {
  const router = useRouter();
  const { address: farmAddress } = router.query;
  const provider = useProvider();

  const [farm, setFarm] = useState<Farm>();

  useEffect(() => {
    if (!farmAddress) {
      return;
    }

    //SETS THE FARM
    const fn = async () => {
      const msr = MoolaStakingRewards__factory.connect(
        farmAddress.toString(),
        provider
      );
      const stakingToken = IUniswapV2Pair__factory.connect(
        await msr.stakingToken(),
        provider
      );
      let farmName = await stakingToken.symbol();
      try {
        const token0Symbol = await ERC20__factory.connect(
          await stakingToken.token0(),
          provider
        ).symbol();
        const token1Symbol = await ERC20__factory.connect(
          await stakingToken.token1(),
          provider
        ).symbol();
        farmName = `${token0Symbol}-${token1Symbol}`;
      } catch (e) {
        console.error("Not an LP token");
      }
      setFarm({
        farmAddress: farmAddress.toString(),
        rewardToken: await msr.rewardsToken(),
        manager: await msr.rewardsDistribution(),
        farmName,
      });
    };
    void fn();
  }, [farmAddress, provider]);

  const getConnectedSigner = useGetConnectedSigner();

  const nominateNewOwner = React.useCallback(
    async (farm: Farm, address: string) => {
      //   nominatedOwner = address
      //   sendRewards(farm , amount)
      // },
      // [getConnectedSigner]

      const signer = await getConnectedSigner();
      const msr = MoolaStakingRewards__factory.connect(
        farm.farmAddress,
        signer
      );

      await msr.nominateNewOwner(address);
    },
    [getConnectedSigner]
  );

  const acceptOwnership = React.useCallback(
    async (farm: Farm) => {
      //checks if given address is the nominated owner
      // if (address !=  nominatedOwner || address == "") //how to parse blockchain addresses?
      // {
      //   return
      // }

      const signer = await getConnectedSigner();
      const msr = MoolaStakingRewards__factory.connect(
        farm.farmAddress,
        signer
      );

      await msr.acceptOwnership();
    },
    [getConnectedSigner]
  );

  const setRewardsDistribution = React.useCallback(
    async (farm: Farm, address: string) => {
      const signer = await getConnectedSigner();
      const msr = MoolaStakingRewards__factory.connect(
        farm.farmAddress,
        signer
      );

      await msr.setRewardsDistribution(address);
    },
    [getConnectedSigner]
  );
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
      rewardTokenSymbol,
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
      rewardToken.symbol(),
    ]);
    return {
      periodEnd: Number(periodEnd),
      rewardRate: Number(fromWei(rewardRate.toString())) * SECONDS_PER_WEEK,
      rewardBalance: Number(fromWei(balance.toString())),
      stakingToken,
      owner,
      rewardsDistribution,
      lastReward: lastReward?.toString() || "0",
      rewardTokenSymbol,
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
                Rewards per week: {lookup.rewardRate} {lookup.rewardTokenSymbol}
              </Text>
            )}
            {lookup.rewardBalance && (
              <Text sx={{ display: "block" }}>
                Farm balance: {lookup.rewardBalance} {lookup.rewardTokenSymbol}
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
              Transfer {fromWei(lookup.lastReward)} {lookup.rewardTokenSymbol}
            </Button>
            <Button
              onClick={() => {
                void notify(farm, lookup.lastReward);
                refresh();
              }}
              mr={1}
            >
              Notify {fromWei(lookup.lastReward)} {lookup.rewardTokenSymbol}
            </Button>
            <Button
              onClick={() => {
                const amount = prompt(
                  `Enter amount of ${lookup.rewardTokenSymbol} to transfer`
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
              Transfer custom {lookup.rewardTokenSymbol}
            </Button>
            <Button
              onClick={() => {
                const amount = prompt(
                  `Enter amount of ${lookup.rewardTokenSymbol} to notify`
                );
                if (!amount) {
                  console.warn("Invalid amount");
                  return;
                }
                void notify(farm, toWei(amount));
                refresh();
              }}
              mr={1}
            >
              Notify custom {lookup.rewardTokenSymbol}
            </Button>

            <Button
              onClick={() => {
                const reward_dist_address = prompt(
                  `Enter the address of the rewards distribution`
                );

                if (!reward_dist_address) {
                  console.warn("Invalid address");
                  return;
                }
                void setRewardsDistribution(farm, reward_dist_address);
              }}
              mr={1}
            >
              Set rewards distribution {lookup.rewardTokenSymbol}
            </Button>

            <Button
              onClick={() => {
                const input = prompt(`Enter the address of the new owner`);

                if (!input) {
                  console.warn("Invalid address");
                  return;
                }

                void nominateNewOwner(farm, input);
                refresh();
              }}
              mr={1}
            >
              Nominate owner
            </Button>

            <Button
              onClick={() => {
                const input = prompt(
                  "Are you sure you'd like to accept ownership of this farm? (Y\\N)"
                );

                if (!input) {
                  console.warn("Invalid input");
                  return;
                }

                if (input == "Y") {
                  void acceptOwnership(farm);
                }
              }}
              mr={1}
            >
              Accept Ownership
            </Button>
          </Box>
        </Card>
      )}
    </div>
  );
};

export default Rewards;
