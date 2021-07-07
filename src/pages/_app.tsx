import "normalize.css/normalize.css";
import "@celo-tools/use-contractkit/lib/styles.css";

import {
  Alfajores,
  ContractKitProvider,
  Mainnet,
} from "@celo-tools/use-contractkit";
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
      dappName="Romulus"
      dappDescription="A governance management system"
      dappUrl="https://romulus.page"
      networks={[Mainnet, Alfajores]}
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
