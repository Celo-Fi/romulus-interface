import { Box } from "rebass/styled-components";
import styled from "styled-components";

const Row = styled(Box)<{
  width?: string;
  align?: string;
  justify?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
}>`
  width: ${({ width }) => width ?? "100%"};
  display: flex;
  padding: 0;
  align-items: ${({ align }) => align ?? "center"};
  justify-content: ${({ justify }) => justify ?? "flex-start"};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`;

export const RowFlat = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

export const RowBetween = styled(Row)`
  justify-content: space-between;
`;
