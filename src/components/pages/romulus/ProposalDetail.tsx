import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import React from "react";
import { Box, Card, Text } from "theme-ui";
import { TypedEvent } from "../../../generated/commons";

interface IProps {
  proposalEvent: TypedEvent<
    [
      BigNumber,
      string,
      string[],
      BigNumber[],
      string[],
      string[],
      BigNumber,
      BigNumber,
      string
    ] & {
      id: BigNumber;
      proposer: string;
      targets: string[];
      values: BigNumber[];
      signatures: string[];
      calldatas: string[];
      startBlock: BigNumber;
      endBlock: BigNumber;
      description: string;
    }
  >;
}

export const ProposalDetail: React.FC<IProps> = ({ proposalEvent }) => {
  const router = useRouter();
  const { address: romulusAddress } = router.query;

  if (!romulusAddress) {
    return <div>Invalid romulus address</div>;
  }

  return (
    <Card>
      <Box mb={1}>
        <Text>
          {proposalEvent.args.description === ""
            ? "No description."
            : proposalEvent.args.description.split("\n").map((line, idx) => (
                <>
                  <Text
                    sx={{
                      display: "block",
                      overflowWrap: "anywhere",
                      paddingBottom: "8px",
                    }}
                    key={idx}
                  >
                    {line}
                  </Text>
                </>
              ))}
        </Text>
      </Box>
    </Card>
  );
};
