import { BigNumber, ContractTransaction } from "ethers";
import { formatEther, getAddress, parseEther } from "ethers/lib/utils";
import { FormikErrors, useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Card, Heading, Input, Paragraph } from "theme-ui";

import { LinearReleaseToken__factory } from "../../../../generated";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../../hooks/useProviderOrSigner";
import { RELEASE_POOF_ADDRESS } from "../../../../pages/poof";
import { TransactionHash } from "../../../common/blockchain/TransactionHash";

interface IForm {
  address: string;
  amount: string;
}

export const ReleasePoof: React.FC = () => {
  const provider = useProvider();
  const getConnectedSigner = useGetConnectedSigner();
  const [tx, setTx] = useState<ContractTransaction | null>(null);
  const { handleChange, handleSubmit, handleBlur, errors, touched, values } =
    useFormik({
      initialValues: {
        address: "",
        amount: "",
      },
      validate: (values) => {
        const errors: FormikErrors<IForm> = {};

        try {
          getAddress(values.address);
        } catch (e) {
          errors.address = (e as Error).message;
        }

        try {
          parseEther(values.amount);
        } catch (e) {
          errors.amount = (e as Error).message;
        }

        return errors;
      },
      onSubmit: async (values) => {
        const signer = await getConnectedSigner();
        const releasePOOF = LinearReleaseToken__factory.connect(
          RELEASE_POOF_ADDRESS,
          signer
        );
        const parsedAmount = parseEther(values.amount);
        console.log(
          `Sending ${formatEther(parsedAmount)} rPOOF to ${values.address}`
        );
        console.log(parsedAmount.toString());
        const tx = await releasePOOF.allocate([values.address], [parsedAmount]);
        setTx(tx);
        console.log("result", await tx.wait());
      },
    });
  const [currentBalance, setCurrentBalance] = useState<BigNumber | null>(null);

  useEffect(() => {
    void (async () => {
      setCurrentBalance(
        await LinearReleaseToken__factory.connect(
          RELEASE_POOF_ADDRESS,
          provider
        ).balanceOf(values.address)
      );
    })();
  }, [values.address, provider]);

  return (
    <form onSubmit={handleSubmit}>
      <Card p={4}>
        <Heading as="h2" pb={2}>
          Allocate Release POOF
        </Heading>
        {tx && <TransactionHash value={tx} />}
        <Input
          my={2}
          id="address"
          name="address"
          placeholder="To address"
          value={values.address}
          color={touched.address && errors.address ? "red" : "white"}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        {touched.address && errors.address && (
          <Paragraph color="red">{errors.address}</Paragraph>
        )}
        {currentBalance && (
          <Paragraph>
            Current balance: {formatEther(currentBalance)} rPOOF ($
            {(parseFloat(formatEther(currentBalance)) * 0.1).toFixed(2)})
          </Paragraph>
        )}
        <Input
          my={2}
          id="amount"
          name="amount"
          placeholder="Amount"
          value={values.amount}
          color={touched.amount && errors.amount ? "red" : "white"}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        {touched.amount && errors.amount && (
          <Paragraph color="red">{errors.amount}</Paragraph>
        )}
        {values.amount && (
          <Paragraph>
            Amount to send: {formatEther(parseEther(values.amount))} rPOOF ($
            {(parseFloat(formatEther(parseEther(values.amount))) * 0.1).toFixed(
              2
            )}
            )
          </Paragraph>
        )}
        <Button my={2} type="submit" color="animated">
          Submit
        </Button>
      </Card>
    </form>
  );
};
