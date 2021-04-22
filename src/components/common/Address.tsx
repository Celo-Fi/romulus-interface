import { Anchor } from "@dracula/dracula-ui";
import { getAddress } from "ethers/lib/utils";
import React from "react";

interface IProps {
  value: string | null;
}

export const Address: React.FC<IProps> = ({ value }: IProps) => {
  if (!value) {
    return <>--</>;
  }
  const fmt = getAddress(value);
  return (
    <Anchor
      href={`https://explorer.celo.org/address/${fmt.toLowerCase()}/transactions`}
    >
      {fmt}
    </Anchor>
  );
};
