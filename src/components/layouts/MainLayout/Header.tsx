import {
  Alfajores,
  Baklava,
  Mainnet,
  useContractKit,
} from "@celo-tools/use-contractkit";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import copyToClipboard from "copy-to-clipboard";
import Link from "next/link";
import React from "react";
import { Box, Button, Container, Flex, Select, Text } from "theme-ui";

export const truncateAddress = (addr: string): string =>
  addr.slice(0, 6) + "..." + addr.slice(addr.length - 4);

const NETWORKS = [Mainnet, Alfajores, Baklava];

export const Header: React.FC = () => {
  const { address, network, updateNetwork, connect, destroy } =
    useContractKit();

  return (
    <Flex
      sx={{ justifyContent: "space-between", alignItems: "center" }}
      pt={[4, 3]}
      mb={4}
    >
      <Link href="/">
        <Text
          css={css`
            cursor: pointer;
            user-select: none;
          `}
        >
          <Text variant="logo" sx={{ fontSize: 4 }}>
            🏛️<Text sx={{ display: ["none", "inherit"] }}> Romulus</Text>
          </Text>
        </Text>
      </Link>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Container
          sx={{
            mr: 3,
            bg: "gray",
            borderRadius: 8,
            height: "fit-content",
          }}
        >
          <Select
            value={network.name}
            sx={{
              minWidth: "fit-content",
              pr: 4,
              bg: "gray",
            }}
            onChange={(e) => {
              const nextNetwork = NETWORKS.find(
                (n) => n.name === e.target.value
              );
              if (nextNetwork) {
                updateNetwork(nextNetwork);
              }
            }}
          >
            {NETWORKS.map((n) => (
              <option
                key={n.name}
                value={n.name}
                selected={n.name === network.name}
              >
                {n.name}
              </option>
            ))}
          </Select>
        </Container>
        <Box
          sx={{ textAlign: "center", width: "100%", minWidth: "fit-content" }}
        >
          {address ? (
            <>
              <ClickableText
                onClick={() => {
                  copyToClipboard(address);
                }}
              >
                {truncateAddress(address)}{" "}
              </ClickableText>
              <br />
              <ClickableText
                color="secondary"
                onClick={() => {
                  void destroy();
                }}
              >
                (disconnect)
              </ClickableText>
            </>
          ) : (
            <Button
              onClick={() => {
                void connect();
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

const ClickableText = styled(Text)`
  cursor: pointer;
`;
