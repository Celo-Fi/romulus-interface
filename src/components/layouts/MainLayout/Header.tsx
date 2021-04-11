import {
  Alfajores,
  Baklava,
  Mainnet,
  useContractKit,
} from "@celo-tools/use-contractkit";
import styled from "@emotion/styled";
import copyToClipboard from "copy-to-clipboard";

const truncateAddress = (addr: string) =>
  addr.slice(0, 6) + "..." + addr.slice(addr.length - 4);

const NETWORKS = [Mainnet, Alfajores, Baklava];

export const Header: React.FC = () => {
  const { address, network, updateNetwork, connect } = useContractKit();

  return (
    <Wrapper>
      <Logo>Romulus</Logo>
      <Account>
        <span>
          Network:{" "}
          <select
            value={network.name}
            onChange={(e) => {
              const nextNetwork = NETWORKS.find(
                (n) => n.name === e.target.value
              );
              if (nextNetwork) {
                updateNetwork(nextNetwork);
              }
            }}
          >
            {NETWORKS.map((n) => (
              <option
                key={n.name}
                value={n.name}
                selected={n.name === network.name}
              >
                {n.name}
              </option>
            ))}
          </select>
        </span>
        {address ? (
          <>
            <AccountText
              onClick={() => {
                copyToClipboard(address);
              }}
            >
              {truncateAddress(address)}
            </AccountText>
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
