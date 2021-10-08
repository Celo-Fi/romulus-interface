import { useGetConnectedSigner } from "@celo-tools/use-contractkit";
import React from "react";
import { Button } from "theme-ui";
import { useMultisigContract } from "../../../../hooks/useMultisigContract";

enum Pool {
  CELOUSD,
  CELOEUR,
  CELOUBE,
  CELORCELO,
}

const calls = {
  [Pool.CELOUSD]: {
    send: "0xa9059cbb000000000000000000000000bbc8c824c638fd238178a71f5b1e5ce7e4ce586b0000000000000000000000000000000000000000000000c77e4256863d800000",
    farm: "0xbbC8C824c638fd238178a71F5b1E5Ce7e4Ce586B",
    notify:
      "0x3c6b16ab0000000000000000000000000000000000000000000000c77e4256863d800000",
  },
  [Pool.CELOEUR]: {
    send: "0xa9059cbb0000000000000000000000000f3d01aea89da0b6ad81712edb96fa7af1c17e9b0000000000000000000000000000000000000000000000c77e4256863d800000",
    farm: "0x0F3d01aea89dA0b6AD81712Edb96FA7AF1c17E9B",
    notify:
      "0x3c6b16ab0000000000000000000000000000000000000000000000c77e4256863d800000",
  },
  [Pool.CELOUBE]: {
    send: "0xa9059cbb0000000000000000000000009d87c01672a7d02b2dc0d0eb7a145c7e13793c3b00000000000000000000000000000000000000000000004acf58e07257100000",
    farm: "0x9D87c01672A7D02b2Dc0D0eB7A145C7e13793c3B",
    notify:
      "0x3c6b16ab00000000000000000000000000000000000000000000004acf58e07257100000",
  },
  [Pool.CELORCELO]: {
    send: "0xa9059cbb000000000000000000000000194478aa91e4d7762c3e51eee57376ea9ac72761000000000000000000000000000000000000000000000018e1e7941d204c0000",
    farm: "0x194478Aa91e4D7762c3E51EeE57376ea9ac72761",
    notify:
      "0x3c6b16ab000000000000000000000000000000000000000000000018e1e7941d204c0000",
  },
};

export const D4P = () => {
  const multisig = useMultisigContract(
    "0x0Ce41DbCEA62580Ae2C894a7D93E97da0c3daC3a"
  );
  const getConnectedSigner = useGetConnectedSigner();
  const sendCELO = React.useCallback(
    async (pool: Pool) => {
      const signer = await getConnectedSigner();
      await multisig
        .connect(signer as any)
        .submitTransaction(
          "0x471ece3750da237f93b8e339c536989b8978a438",
          0,
          calls[pool].send
        );
    },
    [multisig, getConnectedSigner]
  );
  const notify = React.useCallback(
    async (pool: Pool) => {
      const signer = await getConnectedSigner();
      await multisig
        .connect(signer as any)
        .submitTransaction(calls[pool].farm, 0, calls[pool].notify);
    },
    [multisig, getConnectedSigner]
  );
  return (
    <div>
      <Button onClick={() => sendCELO(Pool.CELOUSD)}>
        Transfer CELO to CELO-mcUSD
      </Button>
      <br />
      <Button onClick={() => sendCELO(Pool.CELOEUR)}>
        Transfer CELO to CELO-mcEUR
      </Button>
      <br />
      <Button onClick={() => sendCELO(Pool.CELOUBE)}>
        Transfer CELO to UBE-CELO
      </Button>
      <br />
      <Button onClick={() => sendCELO(Pool.CELORCELO)}>
        Transfer CELO to rCELO-CELO
      </Button>
      <br />

      <Button onClick={() => notify(Pool.CELOUSD)}>
        Notify CELO to CELO-mcUSD
      </Button>
      <br />
      <Button onClick={() => notify(Pool.CELOEUR)}>
        Notify CELO to CELO-mcEUR
      </Button>
      <br />
      <Button onClick={() => notify(Pool.CELOUBE)}>
        Notify CELO to UBE-CELO
      </Button>
      <br />
      <Button onClick={() => notify(Pool.CELORCELO)}>
        Notify CELO to rCELO-CELO
      </Button>
    </div>
  );
};
