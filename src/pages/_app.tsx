import "@celo-tools/use-contractkit/lib/styles.css";
import "normalize.css/normalize.css";

import { Alfajores, ContractKitProvider } from "@celo-tools/use-contractkit";
import { Global } from "@emotion/react";
import { AppProps } from "next/app";
import React from "react";

import { globalStyles } from "../components/layouts/globalStyles";
import { MainLayout } from "../components/layouts/MainLayout";

const RomulusApp: React.FC<AppProps> = ({ Component }: AppProps) => {
  return (
    <ContractKitProvider dappName="Romulus" networks={[Alfajores]}>
      <Global styles={globalStyles} />
      <MainLayout>
        <Component />
      </MainLayout>
    </ContractKitProvider>
  );
};

export default RomulusApp;
