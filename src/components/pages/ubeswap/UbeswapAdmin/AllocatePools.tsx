import { ContractTransaction } from "ethers";
import { getAddress } from "ethers/lib/utils";
import React, { useState } from "react";
import { Button, Card, Heading } from "theme-ui";

import { usePoolManager } from "../../../../hooks/usePoolManager";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";

export const AllocatePools: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const { poolManager } = usePoolManager();
  const [tx, setTx] = useState<ContractTransaction | null>(null);

  return (
    <Card p={4}>
      <Heading as="h2" pb={2}>
        WELCOME TO THE JANK
      </Heading>
      <TransactionHash value={tx} />
      <Button
        onClick={async () => {
          const signer = await getConnectedSigner();
          const newPools = [
            // UBE-CELO
            ["0xe7b5ad135fa22678f426a381c7748f6a5f2c9e6c", 64],
            // UBE-MCUSD
            // ["0x59b22100751b7fda0c88201fb7a0eaf6fc30bcc7", 0],
            // UBE-mcEUR
            // ["0x8c89f7bb791d94e10eed4eb78d0e886c82d7a2e3", 0],
            // CELO-mcUSD
            // ["0xf5b1bc6c9c180b64f5711567b1d6a51a350f8422", 5],
            // CELO-mcEUR
            // ["0x427c95a1379182121791cc415125acd73ea02e97", 4],
            // mcUSD-mcEUR
            // ["0x27616d3dba43f55279726c422daf644bc60128a8", 2],
            // cMCO2-cUSD
            // ["0x6626da55d43425a4ec1067b091cf87a7efbdad6b", 0],
            // cBTC-MCUSD
            // ["0x83CF02F79Be87A7402A3Cac013d0e1C95FeFcAba", 6],
            // POOF-UBE
            ["0x573bcebd09ff805ed32df2cb1a968418dc74dcf7", 7],
            // rCELO-CELO
            ["0x58fff7110e39c733fd37742b8850f9205fbc351b", 3],
            // cETH-CELO
            // ["0xc0864bec4e878371d2bfb1e92928e30a2fe91cf1", 0],
            // cETH-mcUSD
            ["0xb5108b01280f994e67dc8bc3cd1e2433fa3a1b41", 6],
            // MOO-mCELO
            ["0x69d5646e63C7cE63171F76EBA89348b52c1D552c", 2],
          ] as const;

          const tx = await poolManager.connect(signer).batchSetWeight(
            newPools.map((p) => getAddress(p[0])),
            newPools.map((p) => p[1])
          );
          setTx(tx);
        }}
      >
        Update pool weights
      </Button>
    </Card>
  );
};
