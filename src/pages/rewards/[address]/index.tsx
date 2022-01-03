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
    async (farm: Farm, nominatedOwner: string) => {
      const signer = await getConnectedSigner();
      const msr = MoolaStakingRewards__factory.connect(
        farm.farmAddress,
        signer
      );
      await msr.nominateNewOwner(nominatedOwner);
    },
    [getConnectedSigner]
  );

  const acceptOwnership = React.useCallback(
    async (farm: Farm) => {
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
    async (farm: Farm, rewardsDistribution: string) => {
      const signer = await getConnectedSigner();
      const msr = MoolaStakingRewards__factory.connect(
        farm.farmAddress,
        signer
      );
      await msr.setRewardsDistribution(rewardsDistribution);
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

  const checkOwner = React.useCallback(async () => {
    const signer = await getConnectedSigner();
    return signer._address === lookup?.owner;
  }, [lookup, getConnectedSigner]);

  const checkNominatedOwner = React.useCallback(async () => {
    if (!farm) return;
    const signer = await getConnectedSigner();
    const msr = MoolaStakingRewards__factory.connect(farm.farmAddress, signer);
    const nominatedOwner = await msr.nominatedOwner();
    return nominatedOwner === signer._address;
  }, [farm, getConnectedSigner]);

  const [isNominatedOwner] = useAsyncState(false, checkNominatedOwner);
  const [isOwner] = useAsyncState(false, checkOwner);

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
            {(isOwner || isNominatedOwner) && (
              <Text style={{ whiteSpace: "pre-line" }}> {"\n\n"} </Text>
            )}
            {isOwner && (
              <Button
                onClick={() => {
                  const rewardsDistribution = prompt(
                    `Enter the address of the rewards distribution`
                  );
                  if (!rewardsDistribution) {
                    console.warn("Invalid address");
                    return;
                  }
                  void setRewardsDistribution(farm, rewardsDistribution);
                  refresh();
                }}
                mr={1}
              >
                Set rewards distribution
              </Button>
            )}
            {isOwner && (
              <Button
                onClick={() => {
                  const nominatedOwner = prompt(
                    `Enter the address of the new owner`
                  );

                  if (!nominatedOwner) {
                    console.warn("Invalid address");
                    return;
                  }
                  void nominateNewOwner(farm, nominatedOwner);
                  refresh();
                }}
                mr={1}
              >
                Nominate owner
              </Button>
            )}
            {isNominatedOwner && (
              <Button
                onClick={() => {
                  void acceptOwnership(farm);
                  refresh();
                }}
                mr={1}
              >
                Accept Ownership
              </Button>
            )}
          </Box>
        </Card>
      )}
    </div>
  );
};

export default Rewards;
