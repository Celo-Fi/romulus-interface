import { getAddress } from "ethers/lib/utils";
import { useRouter } from "next/dist/client/router";
import React from "react";

import { MultisigAddTransaction } from "../../../components/pages/multisigs/MultisigAddTransaction";

const MultisigAddTransactionPage: React.FC = () => {
  const router = useRouter();
  const { address: multisigAddress } = router.query;

  if (!multisigAddress) {
    return <div>Loading...</div>;
  }

  const fmtAddress = getAddress(multisigAddress?.toString());
  return <MultisigAddTransaction address={fmtAddress} />;
};

export default MultisigAddTransactionPage;
