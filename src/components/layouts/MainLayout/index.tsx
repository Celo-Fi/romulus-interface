import Head from "next/head";
import React from "react";
import { Box, Flex } from "theme-ui";

import { Footer } from "./Footer";
import { Header } from "./Header";

interface Props {
  title?: string;
  children?: React.ReactNode;
}

export const MainLayout: React.FC<Props> = ({
  children,
  title = "Romulus",
}: Props) => {
  return (
    <Flex
      sx={{
        width: "100%",
        px: [4, 4],
        py: [3, 3],
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Head>
        <title>{title}</title>
      </Head>
      <Box>
        <Header />
      </Box>
      <Box sx={{ flex: "1 1 auto" }}>{children}</Box>
      <Box>
        <Footer />
      </Box>
    </Flex>
  );
};
