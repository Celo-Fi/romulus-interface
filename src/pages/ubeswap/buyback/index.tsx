import styled from "@emotion/styled";
import { ContractTransaction } from "ethers";
import React, { useState } from "react";
import { Box, Button, Card, Heading, Text } from "theme-ui";
import Web3 from "web3";
import { AbiItem, fromWei, toBN } from "web3-utils";

import { usePoolManager } from "../../../hooks/usePoolManager";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../hooks/useProviderOrSigner";
import { TransactionHash } from "../../../components/common/blockchain/TransactionHash";
import ERC20Abi from "../../../abis/ERC20.json";
import UbeMakerAbi from "../../../abis/ubeswap/UbeMaker.json";
import { useAsyncState } from "../../../hooks/useAsyncState";
import { ERC20__factory, UbeMaker__factory } from "../../../generated";
import { IUniswapV2Pair__factory } from "../../../generated/factories/IUniswapV2Pair__factory";
import { Address } from "../../../components/common/Address";
import { useMultisigContract } from "../../../hooks/useMultisigContract";
import { useContractKit } from "@celo-tools/use-contractkit";

const web3 = new Web3("https://forno.celo.org"); // TODO: HARDCODE
const UBE_MAKER = "0x9598143CaD531593ebEA31Cbf074106a92D3ccb0";
const UBE_MULTISIG = "0x0Ce41DbCEA62580Ae2C894a7D93E97da0c3daC3a";
const multisigOwners = [
  "0x98002Bc97eE37914cFd29b853792eA880101e57f",
  "0x9eb32a2962f006bD6F8357ae7AB0954e9999fC15",
];
const MCUSD = "0x918146359264C492BD6934071c6Bd31C854EDBc3";
const CELO = "0x471EcE3750Da237f93B8E339c536989b8978a438";

const transferInterface = ERC20Abi.find((f) => f.name === "transfer");
const getTransferData = (recipient: string, amount: string) =>
  transferInterface
    ? web3.eth.abi.encodeFunctionCall(transferInterface as AbiItem, [
        recipient,
        amount,
      ])
    : null;
const setBridgeInterface = UbeMakerAbi.find((f) => f.name === "setBridge");
const getSetBridgeData = (token: string, bridge: string) =>
  setBridgeInterface
    ? web3.eth.abi.encodeFunctionCall(setBridgeInterface as AbiItem, [
        token,
        bridge,
      ])
    : null;

const UbeswapBuybackPage: React.FC = () => {
  const { address } = useContractKit();
  const provider = useProvider();
  const getConnectedSigner = useGetConnectedSigner();
  const { poolInfo } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);
  const ubeswapMultisig = useMultisigContract(UBE_MULTISIG);

  const isMultisigOwner = multisigOwners.some(
    (a) => a.toLowerCase() === address?.toLowerCase()
  );

  const buybackBalanceCall = React.useCallback(async () => {
    const lookup: Record<string, string> = {};
    await Promise.all(
      Object.values(poolInfo).map(async (pool) => {
        const contract = new web3.eth.Contract(
          ERC20Abi as AbiItem[],
          pool.stakingToken
        );
        lookup[pool.stakingToken] = await contract.methods
          .balanceOf(UBE_MAKER)
          .call();
      })
    );
    return lookup;
  }, [web3, poolInfo]);
  const [buybackBalanceLookup, refetchBuybackBalance] = useAsyncState(
    null,
    buybackBalanceCall
  );
  const multisigBalanceCall = React.useCallback(async () => {
    const lookup: Record<string, string> = {};
    await Promise.all(
      Object.values(poolInfo).map(async (pool) => {
        const contract = new web3.eth.Contract(
          ERC20Abi as AbiItem[],
          pool.stakingToken
        );
        lookup[pool.stakingToken] = await contract.methods
          .balanceOf(UBE_MULTISIG)
          .call();
      })
    );
    return lookup;
  }, [web3, poolInfo]);
  const [multisigBalanceLookup, refetchMultisigBalance] = useAsyncState(
    null,
    multisigBalanceCall
  );
  const tokenSymbolCall = React.useCallback(async () => {
    const lookup: Record<string, [string, string]> = {};
    await Promise.all(
      Object.values(poolInfo).map(async (pool) => {
        const lpToken = IUniswapV2Pair__factory.connect(
          pool.stakingToken,
          provider
        );
        const token0 = await ERC20__factory.connect(
          await lpToken.token0(),
          provider
        ).symbol();
        const token1 = await ERC20__factory.connect(
          await lpToken.token1(),
          provider
        ).symbol();
        lookup[pool.stakingToken] = [token0, token1];
      })
    );
    return lookup;
  }, [web3, poolInfo]);
  const [tokenSymbolLookup] = useAsyncState(null, tokenSymbolCall);
  const tokenBridgeCall = React.useCallback(async () => {
    const lookup: Record<string, string> = {};
    await Promise.all(
      Object.values(poolInfo).map(async (pool) => {
        const lpToken = IUniswapV2Pair__factory.connect(
          pool.stakingToken,
          provider
        );
        const token0 = await lpToken.token0();
        const token0Symbol = await ERC20__factory.connect(
          token0,
          provider
        ).symbol();
        lookup[token0Symbol] = await UbeMaker__factory.connect(
          UBE_MAKER,
          provider
        ).bridgeFor(token0);

        const token1 = await lpToken.token1();
        const token1Symbol = await ERC20__factory.connect(
          token1,
          provider
        ).symbol();
        lookup[token1Symbol] = await UbeMaker__factory.connect(
          UBE_MAKER,
          provider
        ).bridgeFor(token1);
      })
    );
    return lookup;
  }, [web3, poolInfo]);
  const [tokenBridgeLookup, refetchBridge] = useAsyncState(
    null,
    tokenBridgeCall
  );

  const filteredPools = Object.values(poolInfo)
    .sort((a, b) => {
      const multisigBalanceA = toBN(
        multisigBalanceLookup?.[a.stakingToken] ?? "0"
      );
      const multisigBalanceB = toBN(
        multisigBalanceLookup?.[b.stakingToken] ?? "0"
      );
      const buybackBalanceA = toBN(
        buybackBalanceLookup?.[a.stakingToken] ?? "0"
      );
      const buybackBalanceB = toBN(
        buybackBalanceLookup?.[b.stakingToken] ?? "0"
      );

      if (buybackBalanceA.lt(buybackBalanceB)) {
        return 1;
      } else if (buybackBalanceA.gt(buybackBalanceB)) {
        return -1;
      } else {
        if (multisigBalanceA.lt(multisigBalanceB)) {
          return 1;
        } else if (multisigBalanceA.gt(multisigBalanceB)) {
          return -1;
        }
      }
      return 0;
    })
    .filter((info) => {
      const multisigBalance = toBN(
        multisigBalanceLookup?.[info.stakingToken] ?? "0"
      );
      const buybackBalance = toBN(
        buybackBalanceLookup?.[info.stakingToken] ?? "0"
      );

      return multisigBalance.gt(toBN(0)) || buybackBalance.gt(toBN(0));
    });

  return (
    <Card p={4}>
      <Heading as="h1" pb={2}>
        Ubeswap Buyback Dashboard
      </Heading>
      <Heading as="h3" pb={2}>
        Last transaction hash
        <TransactionHash value={tx} />
      </Heading>

      <Heading as="h3" pb={2}>
        Bulk controls
      </Heading>
      <Box mb={4}>
        {isMultisigOwner && (
          <Button
            onClick={async () => {
              const signer = await getConnectedSigner();
              const multisig = ubeswapMultisig.connect(signer as any);
              filteredPools.forEach(async (info) => {
                const multisigBalance = toBN(
                  multisigBalanceLookup?.[info.stakingToken] ?? "0"
                );
                if (multisigBalance.gt(toBN(0))) {
                  const tx = await multisig.submitTransaction(
                    info.stakingToken,
                    0,
                    getTransferData(
                      UBE_MAKER,
                      multisigBalanceLookup?.[info.stakingToken] ?? ""
                    )!
                  );
                  setTx(tx);
                  refetchBuybackBalance();
                  refetchMultisigBalance();
                }
              });
            }}
            mr={2}
          >
            Transfer All
          </Button>
        )}
        <Button
          onClick={async () => {
            const signer = await getConnectedSigner();
            const ubeMaker = UbeMaker__factory.connect(UBE_MAKER, signer);
            const token0s = [];
            const token1s = [];
            for (const pool of filteredPools) {
              const buybackBalance = toBN(
                buybackBalanceLookup?.[pool.stakingToken] ?? "0"
              );
              if (buybackBalance.gt(toBN(0))) {
                const lpToken = IUniswapV2Pair__factory.connect(
                  pool.stakingToken,
                  signer
                );
                token0s.push(await lpToken.token0());
                token1s.push(await lpToken.token1());
              }
            }
            const bucketSize = 10;
            for (
              let i = 0;
              i < Math.ceil(filteredPools.length / bucketSize);
              i++
            ) {
              const token0Segment = token0s.slice(
                i * bucketSize,
                Math.min((i + 1) * bucketSize, filteredPools.length)
              );
              const token1Segment = token1s.slice(
                i * bucketSize,
                Math.min((i + 1) * bucketSize, filteredPools.length)
              );
              const tx = await ubeMaker.convertMultiple(
                token0Segment,
                token1Segment
              );
              setTx(tx);
              refetchBuybackBalance();
            }
          }}
        >
          Buyback All
        </Button>
      </Box>

      <NextPoolWeights>
        <thead>
          <tr>
            <th>idx</th>
            <th>Pool Name</th>
            <th>Current balance</th>
            <th>Buyback</th>
          </tr>
        </thead>
        <tbody>
          {filteredPools.map((info, idx) => {
            const [token0Symbol, token1Symbol] = tokenSymbolLookup?.[
              info.stakingToken
            ] ?? ["???", "???"];
            const name = `${token0Symbol}-${token1Symbol}`;
            const multisigBalance = toBN(
              multisigBalanceLookup?.[info.stakingToken] ?? "0"
            );
            const buybackBalance = toBN(
              buybackBalanceLookup?.[info.stakingToken] ?? "0"
            );
            const token0Bridge = tokenBridgeLookup?.[token0Symbol] ?? "";
            const token1Bridge = tokenBridgeLookup?.[token1Symbol] ?? "";

            return (
              <tr key={info.stakingToken}>
                <td>{idx}</td>
                <td>
                  <Address value={info.stakingToken} label={name} />
                </td>
                <td>
                  {Number(fromWei(buybackBalance)).toLocaleString(undefined, {
                    maximumSignificantDigits: 2,
                  })}{" "}
                  ULP
                </td>
                <td>
                  <Button
                    onClick={async () => {
                      const signer = await getConnectedSigner();
                      const lpToken = IUniswapV2Pair__factory.connect(
                        info.stakingToken,
                        signer
                      );
                      const ubeMaker = UbeMaker__factory.connect(
                        UBE_MAKER,
                        signer
                      );
                      const tx = await ubeMaker.convert(
                        await lpToken.token0(),
                        await lpToken.token1()
                      );
                      setTx(tx);
                      refetchBuybackBalance();
                    }}
                    disabled={buybackBalance.eq(toBN(0))}
                  >
                    Buyback UBE
                  </Button>
                </td>
                {isMultisigOwner && (
                  <>
                    <td>
                      <Button
                        onClick={async () => {
                          const signer = await getConnectedSigner();
                          const tx = await ubeswapMultisig
                            .connect(signer as any)
                            .submitTransaction(
                              info.stakingToken,
                              0,
                              getTransferData(
                                UBE_MAKER,
                                multisigBalanceLookup?.[info.stakingToken] ?? ""
                              )!
                            );
                          setTx(tx);
                          refetchBuybackBalance();
                          refetchMultisigBalance();
                        }}
                        disabled={multisigBalance.eq(toBN(0))}
                      >
                        Transfer{" "}
                        {Number(fromWei(multisigBalance)).toLocaleString(
                          undefined,
                          {
                            maximumSignificantDigits: 2,
                          }
                        )}{" "}
                        ULP
                      </Button>
                    </td>
                    <td>
                      <Button
                        onClick={async () => {
                          const signer = await getConnectedSigner();
                          const lpToken = IUniswapV2Pair__factory.connect(
                            info.stakingToken,
                            signer
                          );
                          await ubeswapMultisig
                            .connect(signer as any)
                            .submitTransaction(
                              UBE_MAKER,
                              0,
                              getSetBridgeData(
                                await lpToken.token0(),
                                token0Bridge === MCUSD ? CELO : MCUSD
                              )!
                            );
                          refetchBridge();
                        }}
                      >
                        Set {token0Symbol} bridge to{" "}
                        {token0Bridge === MCUSD ? "CELO" : "mcUSD"}
                      </Button>
                      <Text sx={{ display: "block", mb: 2 }}>
                        Current bridge:{" "}
                        <Address value={token0Bridge} truncate />
                      </Text>
                    </td>
                    <td>
                      <Button
                        onClick={async () => {
                          const signer = await getConnectedSigner();
                          const lpToken = IUniswapV2Pair__factory.connect(
                            info.stakingToken,
                            signer
                          );
                          await ubeswapMultisig
                            .connect(signer as any)
                            .submitTransaction(
                              UBE_MAKER,
                              0,
                              getSetBridgeData(
                                await lpToken.token1(),
                                token1Bridge === MCUSD ? CELO : MCUSD
                              )!
                            );
                          refetchBridge();
                        }}
                      >
                        Set {token1Symbol} bridge to{" "}
                        {token1Bridge === MCUSD ? "CELO" : "mcUSD"}
                      </Button>
                      <Text sx={{ display: "block", mb: 2 }}>
                        Current bridge:{" "}
                        <Address value={token1Bridge} truncate />
                      </Text>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </NextPoolWeights>
    </Card>
  );
};

const NextPoolWeights = styled.table`
  width: 100%;

  td {
    text-align: center;
  }
`;

export default UbeswapBuybackPage;
