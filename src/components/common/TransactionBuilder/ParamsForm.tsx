import styled from "@emotion/styled";
import { ParamType } from "ethers/lib/utils";

interface Props<T extends readonly unknown[]> {
  params: readonly ParamType[];
  values: T;
  onChange: (data: T) => void;
}

export const ParamsForm = <T extends readonly unknown[]>({
  params,
  values,
  onChange,
}: Props<T>): React.ReactElement => {
  return (
    <Wrapper>
      {params.map((param, i) => {
        return (
          <Row key={param.name}>
            <span>{param.format("full")}</span>
            {param.components && (
              <ParamsForm
                params={param.components}
                values={
                  (values[i] as unknown[]) ?? Array(param.components.length)
                }
                onChange={(newV) => {
                  const subValues =
                    (values[i] as unknown[]) ??
                    (Array(param.components.length) as unknown[]);
                  const ret = [...subValues];
                  ret[i] = newV;

                  // update parent
                  const nextValues = [...values];
                  nextValues[i] = ret;
                  onChange((nextValues as unknown) as T);
                }}
              />
            )}
          </Row>
        );
      })}
    </Wrapper>
  );
};

const Wrapper = styled.div``;

const Row = styled.div``;
