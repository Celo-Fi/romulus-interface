import styled from "styled-components";
import { Text } from "theme-ui";
import { Governance } from "../../../pages/romulus";
import { AutoColumn, TopSection } from "../../Column";
import { ProtocolImage } from "../../Image";
import { Row, RowBetween } from "../../Row";

interface IProps {
  governanceDescription: Governance | undefined;
}

export const OverviewCard: React.FC<IProps> = ({ governanceDescription }) => {
  return (
    <TopSection gap="md">
      <DataCard>
        <CardSection>
          <AutoColumn gap="md">
            <Row>
              {governanceDescription && (
                <ProtocolImage src={governanceDescription.icon} />
              )}
              <Text sx={{ fontWeight: 600 }}>
                {governanceDescription ? governanceDescription.name : ""}{" "}
                Governance Overview
              </Text>
            </Row>
            <RowBetween>
              <Text sx={{ fontSize: 14 }}>
                Create and view proposals, delegate votes, and participate in
                protocol governance!{" "}
              </Text>
            </RowBetween>{" "}
          </AutoColumn>
        </CardSection>
      </DataCard>
    </TopSection>
  );
};

const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  background: radial-gradient(
    96.02% 99.41% at 1.84% 0%,
    ${(props) => props.theme.primary1} 30%,
    ${(props) => props.theme.bg5} 100%
  );
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 1.5rem;
  opacity: ${({ disabled }) => disabled && "0.4"};
`;
