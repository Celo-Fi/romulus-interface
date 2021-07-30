import { getAddress } from "ethers/lib/utils";
import React from "react";
import { Link } from "theme-ui";

interface IProps {
  value: string | null;
  truncate?: boolean;
}

export const Address: React.FC<IProps> = ({ value, truncate }: IProps) => {
  if (!value) {
    return <>--</>;
  }
  const fmt = getAddress(value);
  return (
    <Link
      href={`https://explorer.celo.org/address/${fmt.toLowerCase()}/transactions`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      {truncate
        ? `${fmt.slice(0, 6)}...${fmt.slice(fmt.length - 5, fmt.length)}`
        : fmt}
    </Link>
  );
};
