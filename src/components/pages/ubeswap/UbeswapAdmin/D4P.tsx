import { useGetConnectedSigner } from "@celo-tools/use-contractkit";
import React from "react";
import { Button, Flex } from "theme-ui";
import { useMultisigContract } from "../../../../hooks/useMultisigContract";
import ERC20Abi from "../../../../abis/ERC20.json";
import MSRAbi from "../../../../abis/MoolaStakingRewards.json";
import { AbiItem, toWei } from "web3-utils";
import Web3 from "web3";
const web3 = new Web3();

enum Pool {
  // Ubeswap controlled
  CELOUSD,
  CELOEUR,
  CELOUBE,
  CELORCELO,

  // Poof controlled
}

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

type Farm = {
  farmAddress: string;
  rewardToken: string;
  amount: string;
};

const farms: Record<Pool, Farm> = {
  [Pool.CELOUSD]: {
    // farm: "0xbbC8C824c638fd238178a71F5b1E5Ce7e4Ce586B", // OLD
    farmAddress: "0x161c77b4919271B7ED59AdB2151FdaDe3F907a1F",
    rewardToken: "0x471ece3750da237f93b8e339c536989b8978a438",
    amount: toWei("3680"),
  },
  [Pool.CELOEUR]: {
    // farm: "0x0F3d01aea89dA0b6AD81712Edb96FA7AF1c17E9B", // OLD
    farmAddress: "0x728C650D1Fb4da2D18ccF4DF45Af70c5AEb09f81",
    rewardToken: "0x471ece3750da237f93b8e339c536989b8978a438",
    amount: toWei("3680"),
  },
  [Pool.CELOUBE]: {
    farmAddress: "0x9D87c01672A7D02b2Dc0D0eB7A145C7e13793c3B",
    rewardToken: "0x471ece3750da237f93b8e339c536989b8978a438",
    amount: toWei("1380"),
  },
  [Pool.CELORCELO]: {
    farmAddress: "0x194478Aa91e4D7762c3E51EeE57376ea9ac72761",
    rewardToken: "0x471ece3750da237f93b8e339c536989b8978a438",
    amount: toWei("459"),
  },
};

export const D4P = () => {
  const multisig = useMultisigContract(
    "0x0Ce41DbCEA62580Ae2C894a7D93E97da0c3daC3a"
  );
  const getConnectedSigner = useGetConnectedSigner();
  const sendCELO = React.useCallback(
    async (pool: Pool) => {
      const signer = await getConnectedSigner();
      const data = getTransferData(farms[pool].farmAddress, farms[pool].amount);
      if (data) {
        await multisig
          .connect(signer as any)
          .submitTransaction(farms[pool].rewardToken, 0, data);
      }
    },
    [multisig, getConnectedSigner]
  );
  const notify = React.useCallback(
    async (pool: Pool) => {
      const signer = await getConnectedSigner();
      const data = getNotifyData(farms[pool].amount);
      if (data) {
        await multisig
          .connect(signer as any)
          .submitTransaction(farms[pool].farmAddress, 0, data);
      }
    },
    [multisig, getConnectedSigner]
  );
  return (
    <div>
      <Flex>
        <Button onClick={() => sendCELO(Pool.CELOUSD)} m={1}>
          Transfer CELO to CELO-mcUSD
        </Button>
        <Button onClick={() => notify(Pool.CELOUSD)} m={1}>
          Notify CELO to CELO-mcUSD
        </Button>
      </Flex>
      <br />
      <Flex>
        <Button onClick={() => sendCELO(Pool.CELOEUR)} m={1}>
          Transfer CELO to CELO-mcEUR
        </Button>
        <Button onClick={() => notify(Pool.CELOEUR)} m={1}>
          Notify CELO to CELO-mcEUR
        </Button>
      </Flex>
      <br />
      <Flex>
        <Button onClick={() => sendCELO(Pool.CELOUBE)} m={1}>
          Transfer CELO to UBE-CELO
        </Button>
        <Button onClick={() => notify(Pool.CELOUBE)} m={1}>
          Notify CELO to UBE-CELO
        </Button>
      </Flex>
      <br />
      <Flex>
        <Button onClick={() => sendCELO(Pool.CELORCELO)} m={1}>
          Transfer CELO to rCELO-CELO
        </Button>
        <Button onClick={() => notify(Pool.CELORCELO)} m={1}>
          Notify CELO to rCELO-CELO
        </Button>
      </Flex>
    </div>
  );
};
