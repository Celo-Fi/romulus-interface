import "normalize.css/normalize.css";
import "@celo-tools/use-contractkit/lib/styles.css";
import "@dracula/dracula-ui/styles/dracula-ui.css";

import {
  Alfajores,
  ContractKitProvider,
  Mainnet,
} from "@celo-tools/use-contractkit";
import { Global } from "@emotion/react";
import { AppProps } from "next/app";
import React from "react";
import { globalStyles } from "../components/layouts/globalStyles";
import { MainLayout } from "../components/layouts/MainLayout";
import Modal from "react-modal";

const RomulusApp: React.FC<AppProps> = ({ Component }: AppProps) => {
  Modal.setAppElement("body");
  return (
    <ContractKitProvider
      dappName="Romulus"
      dappDescription="A governance management system"
      dappUrl="https://romulus.page"
      networks={[Mainnet, Alfajores]}
    >
      <Global styles={globalStyles} />
      <MainLayout>
        <Component />
      </MainLayout>
    </ContractKitProvider>
  );
};

export default RomulusApp;
