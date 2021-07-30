import React from "react";
import { Box, Flex, Text } from "theme-ui";
import { useTopDelegates } from "../../../hooks/romulus/useTopDelegates";
import { fromWei } from "web3-utils";
import { Address } from "../../../components/common/Address";
import { FixedSizeList } from "react-window";
import { BigNumber } from "ethers";

interface RowProps {
  index: number;
  data: [string, BigNumber][];
  style: React.CSSProperties;
}

const Row: React.FC<RowProps> = ({ index, data, style }) => {
  const delegate = data[index]!;

  return (
    <Box style={style}>
      <Flex sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <Text mr={2}>
          {index + 1}. <Address value={delegate[0]} />
        </Text>
        <Box pr={2}>
          <Text sx={{ fontWeight: "bold", mr: 2 }}>
            {Number(fromWei(delegate[1].toString())).toLocaleString()}
          </Text>
          <Text>Voting power</Text>
        </Box>
      </Flex>
    </Box>
  );
};

interface Props {
  romulusAddress?: string;
}

export const TopDelegates: React.FC<Props> = ({ romulusAddress }) => {
  const [topDelegates] = useTopDelegates(romulusAddress || "", 50);

  return (
    <FixedSizeList
      height={240}
      width="100%"
      itemData={topDelegates}
      itemCount={topDelegates.length}
      itemSize={64}
      style={{ marginBottom: "16px", maxWidth: "700px" }}
    >
      {Row}
    </FixedSizeList>
  );
};
