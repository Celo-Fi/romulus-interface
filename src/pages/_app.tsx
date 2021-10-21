import "../styles/globals.css";
import "normalize.css/normalize.css";
import "@celo-tools/use-contractkit/lib/styles.css";
import "react-toastify/dist/ReactToastify.css";

import { ContractKitProvider } from "@celo-tools/use-contractkit";
import { Global, ThemeProvider } from "@emotion/react";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { AppProps } from "next/app";
import React from "react";
import Modal from "react-modal";
import { ToastContainer } from "react-toastify";

import { globalStyles } from "../components/layouts/globalStyles";
import { MainLayout } from "../components/layouts/MainLayout";
import theme from "../theme";

Sentry.init({
  dsn: "https://94b8b8dc0ab64d3d8c8f42c749c46a00@o676708.ingest.sentry.io/6024423",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.01,
});

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
        <ToastContainer />
      </ThemeProvider>
    </ContractKitProvider>
  );
};

export default RomulusApp;
