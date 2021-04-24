import { css } from "@emotion/react";

export const globalStyles = css`
  * {
    box-sizing: border-box;
  }

  html {
    color: var(--purple);
    background: #1d1e26;
  }
  body {
    background: var(--purple-transparent);
    height: 100%;
    width: 100%;
    min-height: 100vh;
  }
`;
