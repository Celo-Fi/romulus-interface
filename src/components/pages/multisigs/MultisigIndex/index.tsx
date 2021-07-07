import styled from "@emotion/styled";
import { BigNumber } from "ethers";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button, Heading, Text } from "theme-ui";

import { useMultisigContract } from "../../../../hooks/useMultisigContract";
import { useProvider } from "../../../../hooks/useProviderOrSigner";
import { SubmissionCard } from "./SubmissionCard";

export interface Submission {
  destination: string;
  value: BigNumber;
  data: string;
  executed: boolean;
  submissionHash: string;
  submittedBy: string;
  id: number;
}

interface Props {
  address: string;
}

export const MultisigIndex: React.FC<Props> = ({
  address: multisigAddress,
}: Props) => {
  const multisig = useMultisigContract(multisigAddress);
  const provider = useProvider();

  const [txCount, setTxCount] = useState<number>(0);

  const [submissions, setSubmissions] = useState<readonly Submission[]>();

  useEffect(() => {
    void (async () => {
      const theTxCount = await multisig.getTransactionCount(true, true);
      setTxCount(theTxCount.toNumber());
    })();
  }, [multisig]);

  useEffect(() => {
    void (async () => {
      provider.resetEventsBlock(0);
      const provMultisig = multisig.connect(provider);
      const prevSubmissions = await provMultisig.queryFilter(
        multisig.filters.Submission(null)
      );

      setSubmissions(
        await Promise.all(
          prevSubmissions.map(async (sub) => {
            const result = await provMultisig.transactions(
              sub.args.transactionId.toNumber()
            );
            return {
              destination: result.destination,
              value: result.value,
              data: result.data,
              executed: result.executed,
              submissionHash: sub.transactionHash,
              submittedBy: (await sub.getTransaction()).from,
              id: sub.args.transactionId.toNumber(),
            };
          })
        )
      );
    })();
  }, [multisig, provider]);

  return (
    <Wrapper>
      <Heading as="h2">Multisig {multisig.address}</Heading>
      <Nav>
        <Link href={`/multisigs/${multisigAddress}/add-transaction`}>
          <Button mb={2}>Add Transaction</Button>
        </Link>
      </Nav>
      <Text sx={{ display: "block", mb: 3 }}>{txCount} transactions</Text>
      <Submissions>
        {submissions?.map((sub, i) => (
          <SubmissionCard key={i} submission={sub} />
        ))}
      </Submissions>
    </Wrapper>
  );
};

const Submissions = styled.div`
  display: grid;
  grid-row-gap: 24px;
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
  a {
    margin-right: 12px;
  }
`;

const Wrapper = styled.div`
  max-width: 100%;
  width: 720px;
  margin: 0 auto;
`;
