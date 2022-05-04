import React from "react";
import styled, { css } from "styled-components";
import { darken } from "polished";
import { ButtonSecondary } from "../Button";

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => css`
    display: flex;
    flex-flow: row nowrap;
  `}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`;

export const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background-color: ${({ theme }) => "#6D619A"};
  border: none;
  border-radius: 12px;
  color: ${({ theme }) => "#E3DFF3"};
  font-weight: 500;
  min-width: 165px;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, "#6D619A")};
    color: ${({ theme }) => "#E3DFF3"};
  }

  ${({ faded }) =>
    faded &&
    css`
      background-color: ${({ theme }) => "#6D619A70"};
      border: 1px solid ${({ theme }) => "#6D619A70"};
      color: ${({ theme }) => "#E3DFF3"};
      :hover,
      :focus {
        border: 1px solid ${({ theme }) => darken(0.05, "#6D619A")};
        color: ${({ theme }) => darken(0.05, "#E3DFF3")};
      }
    `}
`;
