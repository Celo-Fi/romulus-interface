import { getAddress } from "ethers/lib/utils";
import { useRouter } from "next/dist/client/router";
import React from "react";

import { MultisigIndex } from "../../components/pages/multisigs/MultisigIndex";

const MultisigIndexPage: React.FC = () => {
  const router = useRouter();
  const { address: multisigAddress } = router.query;

  if (!multisigAddress) {
    return <div>Loading...</div>;
  }

  const fmtAddress = getAddress(multisigAddress?.toString());
  return <MultisigIndex address={fmtAddress} />;
};

export default MultisigIndexPage;
