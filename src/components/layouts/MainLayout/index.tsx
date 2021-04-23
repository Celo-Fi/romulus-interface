import styled from "@emotion/styled";
import React from "react";

import { Header } from "./Header";

interface Props {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<Props> = ({ children }: Props) => {
  return (
    <Wrapper>
      <Header />
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  /* max-width: 800px; */
  width: 100%;
  margin: 0 auto;
`;
