import styled from "@emotion/styled";
import { defaultAbiCoder, FunctionFragment } from "@ethersproject/abi";
import { BytesLike } from "ethers";
import React from "react";

import { ParamsForm } from "./ParamsForm";

interface Props {
  method: FunctionFragment;
  data: BytesLike;
  onChange: (data: BytesLike) => void;
}

export const TransactionDataBuilder: React.FC<Props> = ({
  method,
  data,
  onChange,
}: Props) => {
  let decoded: readonly unknown[] = Array(method.inputs.length);
  try {
    decoded = defaultAbiCoder.decode(method.inputs, data);
  } catch (e) {
    // ignore failure
  }

  return (
    <ParamsForm
      params={method.inputs}
      values={decoded}
      onChange={(newValues) => {
        onChange(defaultAbiCoder.encode(method.inputs, newValues));
      }}
    />
  );
};

const Wrapper = styled.div``;

const Row = styled.div``;
