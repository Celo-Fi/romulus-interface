import styled from "styled-components";
import { Box } from "theme-ui";

export const ProposalHeaderContainer = styled(Box)`
  display: flex;
  padding: 45px 45px 25px 45px;
  margin-bottom: 32px;
`;

export const DetailsHeaderContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  padding: 25px 45px 0px 45px;
  border-top: 1px solid;
  border-color: rgba(0, 0, 0, 0.3);
`;

export const DetailContainer = styled(Box)`
  border: 3px solid #6d619a;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 16px;
  height: 150px;
  width: 350px;
`;

export const CreateProposalContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  padding: 45px 45px 5px 45px;
`;
