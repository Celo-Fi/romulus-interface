import { css } from "@emotion/react";
import React from "react";

import { ReleasePoof } from "./ReleasePoof";

export const PoofAdmin: React.FC = () => {
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 12px;
      `}
    >
      <ReleasePoof />
    </div>
  );
};
