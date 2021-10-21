import { getAddress } from "ethers/lib/utils";
import React from "react";
import { Link } from "theme-ui";

import { KNOWN_ADDRESSES } from "./FunctionCall/knownABIs";

interface Props {
  value: string | null;
  truncate?: boolean;
  label?: string;
  link?: boolean;
}

export const Address: React.FC<Props> = ({
  value,
  truncate,
  label,
  link = true,
}: Props) => {
  if (!value) {
    return <>--</>;
  }
  const fmt = getAddress(value);

  const text =
    label ??
    KNOWN_ADDRESSES[fmt]?.name ??
    (truncate
      ? `${fmt.slice(0, 6)}...${fmt.slice(fmt.length - 5, fmt.length)}`
      : fmt);
  if (!link) {
    return <>{text}</>;
  }

  return (
    <Link
      href={`https://explorer.celo.org/address/${fmt.toLowerCase()}/transactions`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      {text}
    </Link>
  );
};
