import { StableToken } from "@celo/contractkit";
import {
  ExchangeConfig,
  ExchangeWrapper,
} from "@celo/contractkit/lib/wrappers/Exchange";
import { useContractKit } from "@celo-tools/use-contractkit";
import { BigNumber } from "bignumber.js";
import { parseEther } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";
import { Button, Card, Flex, Heading, Input, Text, Themed } from "theme-ui";

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
    <Card>
      <Heading mb={2}>cEUR Mento</Heading>
      {cfg && (
        <Themed.table css={{ marginBottom: 8 }}>
          <tr>
            <td>
              <Text>Spread</Text>
            </td>
            <td>
              <Text>{cfg.spread.toString()}</Text>
            </td>
          </tr>
          <tr>
            <td>
              <Text>Reserve Fraction</Text>
            </td>
            <td>
              <Text>{cfg.reserveFraction.toString()}</Text>
            </td>
          </tr>
          <tr>
            <td>
              <Text>Update Frequency</Text>
            </td>
            <td>
              <Text>{cfg.updateFrequency.toString()}</Text>
            </td>
          </tr>
          <tr>
            <td>
              <Text>Minimum Reports</Text>
            </td>
            <td>
              <Text>{cfg.minimumReports.toString()}</Text>
            </td>
          </tr>
          <tr>
            <td>
              <Text>Last Bucket Update</Text>
            </td>
            <td>
              <Text>{cfg.lastBucketUpdate.toString()}</Text>
            </td>
          </tr>
        </Themed.table>
      )}
      <Flex>
        <Input
          placeholder="Amount"
          type="text"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
          mr={2}
        />
        {quoteStable && <Text>{quoteStable.toString()}</Text>}
        <Button
          color="animated"
          onClick={async () => {
            if (quoteStable) {
              await exchange
                ?.buyStable(
                  parseEther(amount).toString(),
                  quoteStable.toString()
                )
                .sendAndWaitForReceipt();
            }
          }}
        >
          Trade
        </Button>
      </Flex>
    </Card>
  );
};
