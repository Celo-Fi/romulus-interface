import { css } from "@emotion/react";
import React from "react";

import { AllocatePools } from "./AllocatePools";
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
      <ReleaseUbe />
      <RefreshPools />
      <TransferOwnership />
      <AllocatePools />
      <SetOperator />
    </div>
  );
};
