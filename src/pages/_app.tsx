import "normalize.css/normalize.css";
import "@celo-tools/use-contractkit/lib/styles.css";

import { ContractKitProvider } from "@celo-tools/use-contractkit";
import { Global, ThemeProvider } from "@emotion/react";
import { AppProps } from "next/app";
import React from "react";
import Modal from "react-modal";

import { globalStyles } from "../components/layouts/globalStyles";
import { MainLayout } from "../components/layouts/MainLayout";
import theme from "../theme";

const RomulusApp: React.FC<AppProps> = ({ Component }: AppProps) => {
  Modal.setAppElement("body");
  return (
    <ContractKitProvider
      dapp={{
        name: "Romulus",
        description: "A governance management system",
        url: "https://romulus.page",
        icon: "https://romulus.page/favicon.png",
      }}
    >
      <ThemeProvider theme={theme}>
        <Global styles={globalStyles} />
        <MainLayout>
          <Component />
        </MainLayout>
      </ThemeProvider>
    </ContractKitProvider>
  );
};

export default RomulusApp;
