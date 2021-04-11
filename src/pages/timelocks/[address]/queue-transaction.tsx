import { getAddress } from "ethers/lib/utils";
import { useRouter } from "next/dist/client/router";
import React from "react";

import { TimelockQueueTransaction } from "../../../components/pages/timelocks/TimelockQueueTransaction";

const TimelockQueueTransactionPage: React.FC = () => {
  const router = useRouter();
  const { address: timelockAddress } = router.query;

  if (!timelockAddress) {
    return <div>Loading...</div>;
  }

  const fmtAddress = getAddress(timelockAddress?.toString());
  return <TimelockQueueTransaction address={fmtAddress} />;
};

export default TimelockQueueTransactionPage;
