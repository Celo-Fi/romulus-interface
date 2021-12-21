import React from "react";
import { D4P, D4PMultisig } from "../../ubeswap/UbeswapAdmin/D4P";

import { ReleasePoof } from "./ReleasePoof";

export const PoofAdmin: React.FC = () => {
  return (
    <div>
      <ReleasePoof />
      <D4P manager={D4PMultisig.POOF} />
    </div>
  );
};
