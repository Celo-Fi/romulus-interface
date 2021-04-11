import styled from "@emotion/styled";
import { ParamType } from "ethers/lib/utils";
import React from "react";

import { ValueField } from "./ValueField";

interface Props<T extends readonly unknown[]> {
  params: readonly ParamType[];
  paramsDoc?: Record<string, string>;
  values: T;
  onChange: (data: T) => void;
}

export const ParamsForm = <T extends readonly unknown[]>({
  params,
  paramsDoc,
  values,
  onChange,
}: Props<T>): React.ReactElement => {
  return (
    <Wrapper>
      {params.map((param, i) => {
        return (
          <Row key={param.name}>
            <FieldInfo>
              <span>{param.format("full")}</span>
              {paramsDoc?.[param.name] && <p>{paramsDoc[param.name]}</p>}
            </FieldInfo>
            <div>
              <ValueField
                param={param}
                value={values[i]}
                onChange={(newV) => {
                  const copy = [...values];
                  copy[i] = newV;
                  onChange((copy as unknown) as T);
                }}
              />
            </div>
          </Row>
        );
      })}
    </Wrapper>
  );
};

const FieldInfo = styled.div``;

const Wrapper = styled.div`
  display: grid;
  grid-row-gap: 24px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;
