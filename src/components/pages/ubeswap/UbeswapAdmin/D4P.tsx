import { useGetConnectedSigner } from "@celo-tools/use-contractkit";
import React from "react";
import { Button, Flex, Heading, Text } from "theme-ui";
import { useMultisigContract } from "../../../../hooks/useMultisigContract";
import ERC20Abi from "../../../../abis/ERC20.json";
import MSRAbi from "../../../../abis/MoolaStakingRewards.json";
import { AbiItem, toWei, fromWei } from "web3-utils";
import Web3 from "web3";
import { MultiSig as MultisigContract } from "../../../../generated";
import { useAsyncState } from "../../../../hooks/useAsyncState";
import moment from "moment";

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
  UBE = "UBE",

  // Poof controlled
  POOFUBE = "POOF-UBE",
  PCELOPOOF = "pCELO-POOF",
  pUSDUSD = "pUSD-USDC-cUSD",
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
  pool: Pool;
  farmAddress: string;
  rewardToken: Token;
  amount: string;
  owner: Multisig;
};

// == CONSTANTS ==
const SECONDS_PER_WEEK = 60 * 60 * 24 * 7;
const tokenName: Record<Token, string> = {
  [Token.CELO]: "CELO",
  [Token.POOF]: "POOF",
  [Token.UBE]: "UBE",
};

const farms: Farm[] = [
  {
    pool: Pool.CELOUSD,
    // farm: "0xbbC8C824c638fd238178a71F5b1E5Ce7e4Ce586B", // OLD
    farmAddress: "0x161c77b4919271B7ED59AdB2151FdaDe3F907a1F",
    rewardToken: Token.CELO,
    amount: toWei("3680"),
    owner: Multisig.UBE,
  },
  {
    pool: Pool.CELOEUR,
    // farm: "0x0F3d01aea89dA0b6AD81712Edb96FA7AF1c17E9B", // OLD
    farmAddress: "0x728C650D1Fb4da2D18ccF4DF45Af70c5AEb09f81",
    rewardToken: Token.CELO,
    amount: toWei("3680"),
    owner: Multisig.UBE,
  },
  {
    pool: Pool.CELOUBE,
    farmAddress: "0x9D87c01672A7D02b2Dc0D0eB7A145C7e13793c3B",
    rewardToken: Token.CELO,
    amount: toWei("1380"),
    owner: Multisig.UBE,
  },
  {
    pool: Pool.CELORCELO,
    farmAddress: "0x194478Aa91e4D7762c3E51EeE57376ea9ac72761",
    rewardToken: Token.CELO,
    amount: toWei("459"),
    owner: Multisig.UBE,
  },
  {
    pool: Pool.UBE,
    farmAddress: "0x25e18159Ce62cB815df0E3582a6CFCA5735c65F4",
    rewardToken: Token.UBE,
    amount: toWei("0.1"),
    owner: Multisig.UBE,
  },

  {
    pool: Pool.POOFUBE,
    farmAddress: "0x4274AA72B12221D32ca77cB37057A9692E0b59Eb",
    rewardToken: Token.POOF,
    amount: toWei("7142.8"),
    owner: Multisig.POOF,
  },
  {
    pool: Pool.PCELOPOOF,
    farmAddress: "0x7B7F08164036abEbafD1bf75c1464c6F0d01653C",
    rewardToken: Token.POOF,
    amount: toWei("57142.4"),
    owner: Multisig.POOF,
  },
  {
    pool: Pool.pUSDUSD,
    farmAddress: "0x9d8537b7B940Bba313D4224B915a45460e17a729",
    rewardToken: Token.POOF,
    amount: toWei("7142.8"),
    owner: Multisig.POOF,
  },
];

export const D4P = () => {
  const ubeswapMultisig = useMultisigContract(Multisig.UBE);
  const poofMultisig = useMultisigContract(Multisig.POOF);

  const multisigLookup: Record<Multisig, MultisigContract> = React.useMemo(
    () => ({
      [Multisig.UBE]: ubeswapMultisig,
      [Multisig.POOF]: poofMultisig,
    }),
    [ubeswapMultisig, poofMultisig]
  );

  const getConnectedSigner = useGetConnectedSigner();
  const sendCELO = React.useCallback(
    async (farm: Farm) => {
      const signer = await getConnectedSigner();
      const data = getTransferData(farm.farmAddress, farm.amount);
      if (data) {
        await multisigLookup[farm.owner]
          .connect(signer as any)
          .submitTransaction(farm.rewardToken, 0, data);
      }
    },
    [multisigLookup, getConnectedSigner]
  );
  const notify = React.useCallback(
    async (farm: Farm) => {
      const signer = await getConnectedSigner();
      const data = getNotifyData(farm.amount);
      if (data) {
        await multisigLookup[farm.owner]
          .connect(signer as any)
          .submitTransaction(farm.farmAddress, 0, data);
      }
    },
    [multisigLookup, getConnectedSigner]
  );
  const periodEndCall = React.useCallback(async () => {
    const lookup: Record<string, number> = {};
    await Promise.all(
      farms.map(async (farm) => {
        const contract = new web3.eth.Contract(
          MSRAbi as AbiItem[],
          farm.farmAddress
        );
        const periodEnd = await contract.methods.periodFinish().call();
        lookup[farm.pool] = Number(periodEnd);
      })
    );
    return lookup;
  }, []);
  const [periodEndLookup, refetch1] = useAsyncState(null, periodEndCall);

  const rewardRateCall = React.useCallback(async () => {
    const lookup: Record<string, number> = {};
    await Promise.all(
      farms.map(async (farm) => {
        const contract = new web3.eth.Contract(
          MSRAbi as AbiItem[],
          farm.farmAddress
        );
        const rewardRate = await contract.methods.rewardRate().call();
        lookup[farm.pool] = Number(fromWei(rewardRate)) * SECONDS_PER_WEEK;
      })
    );
    return lookup;
  }, []);
  const [rewardRateLookup, refetch2] = useAsyncState(null, rewardRateCall);

  const rewardBalanceCall = React.useCallback(async () => {
    const lookup: Record<string, number> = {};
    await Promise.all(
      farms.map(async (farm) => {
        const contract = new web3.eth.Contract(
          ERC20Abi as AbiItem[],
          farm.rewardToken
        );
        const balance = await contract.methods
          .balanceOf(farm.farmAddress)
          .call();
        lookup[farm.pool] = Number(fromWei(balance));
      })
    );
    return lookup;
  }, []);
  const [rewardBalanceLookup, refetch3] = useAsyncState(
    null,
    rewardBalanceCall
  );

  return (
    <div>
      <Heading as="h2" mb={2}>
        Multi reward pools
      </Heading>
      {farms.map((farm, idx) => {
        const periodEnd = periodEndLookup?.[farm.pool];
        const rewardRate = rewardRateLookup?.[farm.pool];
        const rewardBalance = rewardBalanceLookup?.[farm.pool];

        return (
          <Flex mb={2} key={idx} sx={{ alignItems: "center" }}>
            <Button onClick={() => sendCELO(farm)} mr={1}>
              Transfer {fromWei(farm.amount)} {tokenName[farm.rewardToken]} to{" "}
              {farm.pool}
            </Button>
            <Button
              onClick={() => {
                notify(farm);
                refetch1();
                refetch2();
                refetch3();
              }}
              mr={2}
            >
              Notify {fromWei(farm.amount)} {tokenName[farm.rewardToken]} to{" "}
              {farm.pool}
            </Button>
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
            </div>
          </Flex>
        );
      })}
    </div>
  );
};
