import React from "react";
import { Button as RebassButton, ButtonProps } from "rebass/styled-components";
import styled from "styled-components";
import { Box } from "theme-ui";

const Base = styled(RebassButton)<{
  padding?: string;
  width?: string;
  borderRadius?: string;
  altDisabledStyle?: boolean;
}>`
  padding: ${({ padding }) => (padding ? padding : "18px")};
  width: ${({ width }) => (width ? width : "100%")};
  font-weight: 500;
  text-align: center;
  border-radius: 20px;
  border-radius: ${({ borderRadius }) => borderRadius && borderRadius};
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  &:disabled {
    cursor: auto;
  }

  > * {
    user-select: none;
  }
`;

export const ButtonSecondary = styled(Base)`
  border: 1px solid ${({ theme }) => "#6D619A"};
  color: ${({ theme }) => "#8878C3"};
  background-color: transparent;
  font-size: 16px;
  border-radius: 12px;
  padding: ${({ padding }) => (padding ? padding : "10px")};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => "#6D619A"};
    border: 1px solid ${({ theme }) => "#BFB7DE"};
  }
  &:hover {
    border: 1px solid ${({ theme }) => "#BFB7DE"};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => "#6D619A"};
    border: 1px solid ${({ theme }) => "#BFB7DE"};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  a:hover {
    text-decoration: none;
  }
`;

export const ReturnRoute = styled(Box)`
  margin-left: 100px;
  margin-bottom: 50px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;
