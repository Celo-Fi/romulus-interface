import { css } from "@emotion/react";
import React from "react";

import { RefreshPools } from "./RefreshPools";
import { ReleaseUbe } from "./ReleaseUbe";

export const UbeswapAdmin: React.FC = () => {
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-column-gap: 24px;
      `}
    >
      <ReleaseUbe />
      <RefreshPools />
    </div>
  );
};
