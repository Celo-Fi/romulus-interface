import "normalize.css/normalize.css";
import "@celo-tools/use-contractkit/lib/styles.css";
import "@dracula/dracula-ui/styles/dracula-ui.css";

import { Alfajores, ContractKitProvider } from "@celo-tools/use-contractkit";
import { Global } from "@emotion/react";
import { AppProps } from "next/app";
import React from "react";

import { globalStyles } from "../components/layouts/globalStyles";
import { MainLayout } from "../components/layouts/MainLayout";

const RomulusApp: React.FC<AppProps> = ({ Component }: AppProps) => {
  return (
    <ContractKitProvider
      dappName="Romulus"
      dappDescription="Romulus"
      dappUrl="https://romulus.page"
      networks={[Alfajores]}
    >
      <Global styles={globalStyles} />
      <MainLayout>
        <Component />
      </MainLayout>
    </ContractKitProvider>
  );
};

export default RomulusApp;
