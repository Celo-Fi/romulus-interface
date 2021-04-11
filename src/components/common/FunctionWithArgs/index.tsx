import styled from "@emotion/styled";
import { FunctionFragment } from "ethers/lib/utils";

interface Props {
  callee?: string;
  frag: FunctionFragment;
  args?: readonly unknown[];
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
}: Props): React.ReactElement => {
  if (!args || args.length === 0) {
    return <Wrapper>{frag.name}()</Wrapper>;
  }
  return (
    <Wrapper>
      {callee ? callee + "." : ""}
      {frag.name}(
      <br />
      {frag.inputs.map((input, i) => (
        <Param key={i}>
          {input.format("full")} {renderValue(args[i])}
          {i !== frag.inputs.length - 1 ? ", " : ""}
          <br />
        </Param>
      ))}
      )
    </Wrapper>
  );
};

const Wrapper = styled.div``;

const renderValue = (value: unknown): React.ReactNode => {
  if (
    typeof value === "undefined" ||
    value === null ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return <Empty>(EMPTY)</Empty>;
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

  if (typeof value === "string" || typeof value === "number") {
    return <Arg>{value}</Arg>;
  }

  return <Arg>{JSON.stringify(value)}</Arg>;
};

const Param = styled.span`
  margin-left: 8px;
`;

const Arg = styled.span`
  color: blue;
`;

const Empty = styled.span`
  color: #aaa;
`;
