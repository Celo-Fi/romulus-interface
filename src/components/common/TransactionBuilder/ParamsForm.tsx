import styled from "@emotion/styled";
import { ParamType } from "ethers/lib/utils";
import React from "react";
import { Box, Flex, Grid, Text } from "theme-ui";

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
    <Grid>
      {params.map((param, i) => {
        return (
          <Flex key={param.name}>
            <Box>
              <Text>{param.format("full")}</Text>
              {paramsDoc?.[param.name] && <p>{paramsDoc[param.name]}</p>}
            </Box>
            <Box>
              <ValueField
                param={param}
                value={values[i]}
                onChange={(newV) => {
                  const copy = [...values];
                  copy[i] = newV;
                  onChange(copy as unknown as T);
                }}
              />
            </Box>
          </Flex>
        );
      })}
    </Grid>
  );
};
