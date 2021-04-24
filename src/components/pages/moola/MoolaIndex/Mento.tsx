import { StableToken } from "@celo/contractkit";
import {
  ExchangeConfig,
  ExchangeWrapper,
} from "@celo/contractkit/lib/wrappers/Exchange";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Button, Card, Heading, Input, Table, Text } from "@dracula/dracula-ui";
import { BigNumber } from "bignumber.js";
import { parseEther } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";

export const Mento: React.FC = () => {
  const { kit } = useContractKit();
  const [exchange, setExchange] = useState<ExchangeWrapper | null>(null);
  const [cfg, setCfg] = useState<ExchangeConfig | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [quoteStable, setQuoteStable] = useState<BigNumber | null>(null);

  useEffect(() => {
    void (async () => {
      const nextExchange = await kit.contracts.getExchange(StableToken.cEUR);
      setExchange(nextExchange);
      setCfg(await nextExchange.getConfig());
    })();
  }, [kit]);

  useEffect(() => {
    if (exchange) {
      if (amount !== "") {
        void (async () => {
          setQuoteStable(
            await exchange.quoteStableBuy(parseEther(amount).toString())
          );
        })();
      }
    }
  }, [amount, exchange]);

  return (
    <Card p="md" variant="subtle" color="purple">
      <Heading pb="sm">cEUR Mento</Heading>
      {cfg && (
        <Table color="cyan">
          <tr>
            <td>Spread</td>
            <td>{cfg.spread.toString()}</td>
          </tr>
          <tr>
            <td>Reserve Fraction</td>
            <td>{cfg.reserveFraction.toString()}</td>
          </tr>
          <tr>
            <td>Update Frequency</td>
            <td>{cfg.updateFrequency.toString()}</td>
          </tr>
          <tr>
            <td>Minimum Reports</td>
            <td>{cfg.minimumReports.toString()}</td>
          </tr>
          <tr>
            <td>Last Bucket Update</td>
            <td>{cfg.lastBucketUpdate.toString()}</td>
          </tr>
        </Table>
      )}
      <Input
        type="text"
        color="white"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
        }}
      />
      {quoteStable && <Text>{quoteStable.toString()}</Text>}
      <Button
        color="animated"
        onClick={async () => {
          if (quoteStable) {
            await exchange
              ?.buyStable(parseEther(amount).toString(), quoteStable.toString())
              .sendAndWaitForReceipt();
          }
        }}
      >
        Trade
      </Button>
    </Card>
  );
};
