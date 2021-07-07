import Head from "next/head";
import React from "react";
import { Box } from "theme-ui";

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
    <Box sx={{ width: "100%", px: [4, 4], py: [3, 3] }}>
      <Head>
        <title>{title}</title>
      </Head>
      <Header />
      {children}
    </Box>
  );
};
