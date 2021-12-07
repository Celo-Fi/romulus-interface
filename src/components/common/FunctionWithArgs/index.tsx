import { BigNumber } from "@ethersproject/bignumber";
import { ConstructorFragment, isAddress } from "ethers/lib/utils";
import React from "react";
import { Box, Text } from "theme-ui";

import { Address } from "../Address";

interface Props {
  callee?: string;
  frag: ConstructorFragment;
  args?: readonly unknown[];
  inline?: boolean;
}

/**
 * Renders a solidity function fragment with call args.
 * @param frag
 * @paramargs
 */
export const FunctionWithArgs = ({
  callee,
  frag,
  args,
  inline = false,
}: Props): React.ReactElement => {
  if (!args || args.length === 0) {
    return (
      <Box>
        <Text>{frag.name}()</Text>
      </Box>
    );
  }

  if (inline) {
    return (
      <>
        {callee ? <Address value={callee} /> : ""}.{frag.name}(
        {frag.inputs.map((input, i) => (
          <React.Fragment key={i}>
            <span>{renderValue(args[i])}</span>
            {i !== frag.inputs.length - 1 ? ", " : ""}
          </React.Fragment>
        ))}
        )
      </>
    );
  }

  return (
    <div tw="flex flex-col">
      <div>
        {callee ? (
          <>
            <Address value={callee} />.
          </>
        ) : (
          ""
        )}
        {frag.name}(
      </div>
      {frag.inputs.map((input, i) => (
        <div key={i} tw="ml-4">
          {input.format("full")} {renderValue(args[i])}
          {i !== frag.inputs.length - 1 ? ", " : ""}
        </div>
      ))}
      <div>)</div>
    </div>
  );
};

const renderValue = (value: unknown): React.ReactNode => {
  if (
    typeof value === "undefined" ||
    value === null ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return <Text>(EMPTY)</Text>;
  }

  if (Array.isArray(value)) {
    return (
      <>
        [
        {value.map((v, i) => (
          <>
            {renderValue(v)}
            {i !== value.length - 1 ? ", " : ""}
          </>
        ))}
        ]
      </>
    );
  }

  if (typeof value === "string" && isAddress(value)) {
    return <Address truncate value={value} />;
  }

  if (typeof value === "string" || typeof value === "number") {
    return <Text variant="highlight">{value}</Text>;
  }

  if (BigNumber.isBigNumber(value)) {
    return <Text variant="highlight">{value.toString()}</Text>;
  }

  return <Text variant="highlight">{JSON.stringify(value)}</Text>;
};
