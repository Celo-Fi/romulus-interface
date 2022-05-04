import { useContractKit } from "@celo-tools/use-contractkit";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Link from "next/link";
import React, { useState } from "react";
import { Box, Button, Container, Flex, Select, Text } from "theme-ui";
import { Button as RebassButton, ButtonProps } from "rebass/styled-components";
import { Web3StatusConnect } from "../../Web3Status";

export const truncateAddress = (addr: string): string =>
  addr.slice(0, 6) + "..." + addr.slice(addr.length - 4);

export const Header: React.FC = () => {
  const { address, network, updateNetwork, connect, destroy } =
    useContractKit();

  const [showDisconnect, setShowDisconnect] = useState(false);

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
        <Box
          sx={{ textAlign: "center", width: "100%", minWidth: "fit-content" }}
        >
          {address ? (
            <>
              <Web3StatusConnect
                id="web3-status-connected"
                onMouseEnter={(e) => setShowDisconnect(true)}
                onMouseLeave={(e) => setShowDisconnect(false)}
                onClick={() => {
                  void destroy();
                }}
                faded={true}
              >
                <>
                  <Text>
                    {showDisconnect ? "Disconnect" : truncateAddress(address)}
                  </Text>
                </>
              </Web3StatusConnect>
            </>
          ) : (
            <Web3StatusConnect
              id="connect-wallet"
              onClick={() => void connect().catch(console.warn)}
              faded={!address}
            >
              <Text>Connect to a wallet</Text>
            </Web3StatusConnect>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};
