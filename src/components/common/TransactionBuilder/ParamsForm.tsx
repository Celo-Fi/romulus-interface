import styled from "@emotion/styled";
import { ParamType } from "ethers/lib/utils";

interface Props {
  params: readonly ParamType[];
  values: readonly any[];
  onChange: (data: readonly any[]) => void;
}

export const ParamsForm: React.FC<Props> = ({ params, values, onChange }) => {
  return (
    <Wrapper>
      {params.map((param, i) => {
        return (
          <Row>
            <span>{param.format("full")}</span>
            {param.components && (
              <ParamsForm
                params={param.components}
                values={values[i] ?? Array(param.components.length)}
                onChange={(newV) => {
                  const ret = values.slice();
                  ret[i] = newV;
                  return ret;
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
