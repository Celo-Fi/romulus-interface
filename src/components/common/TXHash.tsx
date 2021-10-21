import React from "react";
import { Link, Text } from "theme-ui";

interface Props {
  value?: string | null;
}

export const TXHash: React.FC<Props> = ({ value }: Props) => {
  if (!value) {
    return <Text sx={{ display: "block" }}>--</Text>;
  }
  return (
    <Link
      href={`https://explorer.celo.org/tx/${value}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {value}
    </Link>
  );
};
