import { useContractKit } from "@celo-tools/use-contractkit";
import styled from "@emotion/styled";

const truncateAddress = (addr: string) =>
  addr.slice(0, 6) + "..." + addr.slice(addr.length - 4);

export const Header = () => {
  const { kit, address, network, updateNetwork, connect } = useContractKit();
  return (
    <Wrapper>
      <Logo>Romulus</Logo>
      <Account>
        <span>Network: {network.name}</span>
        {address ? (
          <>
            <AccountText>{truncateAddress(address)}</AccountText>
          </>
        ) : (
          <button
            onClick={() => {
              void connect();
            }}
          >
            Connect to Wallet
          </button>
        )}
      </Account>
    </Wrapper>
  );
};

const AccountText = styled.span`
  font-family: monospace;
  margin-left: 4px;
`;

const Account = styled.div``;

const Logo = styled.div`
  font-weight: 600;
  font-size: 24px;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
`;
