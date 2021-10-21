import { useGetConnectedSigner } from "@celo-tools/use-contractkit";
import React from "react";
import { Button, Flex, Heading } from "theme-ui";
import { useMultisigContract } from "../../../../hooks/useMultisigContract";
import ERC20Abi from "../../../../abis/ERC20.json";
import MSRAbi from "../../../../abis/MoolaStakingRewards.json";
import { AbiItem, toWei, fromWei } from "web3-utils";
import Web3 from "web3";
import { MultiSig as MultisigContract } from "../../../../generated";
const web3 = new Web3();

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

  // Poof controlled
  POOFUBE = "POOF-UBE",
  PCELOPOOF = "pCELO-POOF",
  pUSDUSD = "pUSD-USDC-cUSD",
}

enum Token {
  CELO = "0x471ece3750da237f93b8e339c536989b8978a438",
  POOF = "0x00400fcbf0816bebb94654259de7273f4a05c762",
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
const tokenName: Record<Token, string> = {
  [Token.CELO]: "CELO",
  [Token.POOF]: "POOF",
};

const farms: Farm[] = [
  {
    pool: Pool.CELOUSD,
    // farm: "0xbbC8C824c638fd238178a71F5b1E5Ce7e4Ce586B", // OLD
    farmAddress: "0x161c77b4919271B7ED59AdB2151FdaDe3F907a1F",
    rewardToken: Token.CELO,
    // amount: toWei("3680"),
    amount: toWei("0.01"),
    owner: Multisig.UBE,
  },
  {
    pool: Pool.CELOEUR,
    // farm: "0x0F3d01aea89dA0b6AD81712Edb96FA7AF1c17E9B", // OLD
    farmAddress: "0x728C650D1Fb4da2D18ccF4DF45Af70c5AEb09f81",
    rewardToken: Token.CELO,
    // amount: toWei("3680"),
    amount: toWei("0.01"),
    owner: Multisig.UBE,
  },
  {
    pool: Pool.CELOUBE,
    farmAddress: "0x9D87c01672A7D02b2Dc0D0eB7A145C7e13793c3B",
    rewardToken: Token.CELO,
    // amount: toWei("1380"),
    amount: toWei("0.01"),
    owner: Multisig.UBE,
  },
  {
    pool: Pool.CELORCELO,
    farmAddress: "0x194478Aa91e4D7762c3E51EeE57376ea9ac72761",
    rewardToken: Token.CELO,
    // amount: toWei("459"),
    amount: toWei("0.01"),
    owner: Multisig.UBE,
  },
  {
    pool: Pool.POOFUBE,
    farmAddress: "0x4274AA72B12221D32ca77cB37057A9692E0b59Eb",
    rewardToken: Token.POOF,
    amount: toWei("0.01"),
    owner: Multisig.POOF,
  },
  {
    pool: Pool.PCELOPOOF,
    farmAddress: "0x7B7F08164036abEbafD1bf75c1464c6F0d01653C",
    rewardToken: Token.POOF,
    amount: toWei("0.01"),
    owner: Multisig.POOF,
  },
  {
    pool: Pool.pUSDUSD,
    farmAddress: "0x9d8537b7B940Bba313D4224B915a45460e17a729",
    rewardToken: Token.POOF,
    amount: toWei("0.01"),
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
  return (
    <div>
      <Heading as="h2" mb={2}>
        Multi reward pools
      </Heading>
      {farms.map((farm, idx) => {
        return (
          <Flex mb={2} key={idx}>
            <Button onClick={() => sendCELO(farm)} mr={1}>
              Transfer {fromWei(farm.amount)} {tokenName[farm.rewardToken]} to{" "}
              {farm.pool}
            </Button>
            <Button onClick={() => notify(farm)}>
              Notify {fromWei(farm.amount)} {tokenName[farm.rewardToken]} to{" "}
              {farm.pool}
            </Button>
          </Flex>
        );
      })}
    </div>
  );
};
