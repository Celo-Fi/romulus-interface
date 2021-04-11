import MultiSigJSON from "@celo/contracts/build/MultiSig.json";

const MultisigSourcePage: React.FC = () => {
  return <pre>{MultiSigJSON.source}</pre>;
};

export default MultisigSourcePage;
