import { getAddress } from "ethers/lib/utils";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { TimelockIndex } from "../../components/pages/TimelockIndex";

const TimelockIndexPage = () => {
  const router = useRouter();
  const { address: timelockAddress } = router.query;

  if (!timelockAddress) {
    return <div>Loading...</div>;
  }

  const fmtAddress = getAddress(timelockAddress?.toString());
  return <TimelockIndex address={fmtAddress} />;
};

export default TimelockIndexPage;
