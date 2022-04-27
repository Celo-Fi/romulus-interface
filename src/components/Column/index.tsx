import styled from "styled-components";

export const AutoColumn = styled.div<{
  gap?: "sm" | "md" | "lg" | string;
  justify?:
    | "stretch"
    | "center"
    | "start"
    | "end"
    | "flex-start"
    | "flex-end"
    | "space-between";
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) =>
    (gap === "sm" && "8px") ||
    (gap === "md" && "12px") ||
    (gap === "lg" && "24px") ||
    gap};
  justify-items: ${({ justify }) => justify && justify};
`;

export const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
  margin-bottom: 24px;
`;
