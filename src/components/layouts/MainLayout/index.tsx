import styled from "@emotion/styled";
import Head from "next/head";
import React from "react";

import { Header } from "./Header";

interface Props {
  title?: string;
  children?: React.ReactNode;
}

export const MainLayout: React.FC<Props> = ({
  children,
  title = "Romulus",
}: Props) => {
  return (
    <Wrapper>
      <Head>
        <title>{title}</title>
      </Head>
      <Header />
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  /* max-width: 800px; */
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
`;
