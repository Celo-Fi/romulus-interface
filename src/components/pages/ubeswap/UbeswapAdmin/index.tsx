import { css } from "@emotion/react";
import React from "react";

import { AllocatePools } from "./AllocatePools";
import { D4P, D4PMultisig } from "./D4P";
import { RefreshPools } from "./RefreshPools";
import { ReleaseUbe } from "./ReleaseUbe";
import { SetOperator } from "./SetOperator";
import { TransferOwnership } from "./TransferOwnership";

export const UbeswapAdmin: React.FC = () => {
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: 100%;
        grid-gap: 12px;
      `}
    >
      <RefreshPools />
      <AllocatePools />
      <D4P manager={D4PMultisig.UBE} />
      <ReleaseUbe />
      <TransferOwnership />
      <SetOperator />
    </div>
  );
};
