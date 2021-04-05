import { ContractKitProvider } from "@celo-tools/use-contractkit";
import "@celo-tools/use-contractkit/lib/styles.css";
import { AppProps } from "next/app";

const RomulusApp: React.FC<AppProps> = ({ Component }) => {
  return (
    <ContractKitProvider dappName="My awesome dApp">
      <Component />
    </ContractKitProvider>
  );
};

export default RomulusApp;
