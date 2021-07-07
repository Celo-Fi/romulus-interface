import { getAddress } from "@ethersproject/address";
import { FACTORY_ADDRESS } from "@ubeswap/sdk";
import { ContractTransaction } from "ethers";
import { FormikErrors, useFormik } from "formik";
import React, { useState } from "react";
import { Button, Card, Heading, Input, Paragraph } from "theme-ui";

import { UbeswapFactory__factory } from "../../generated";
import { useGetConnectedSigner } from "../../hooks/useProviderOrSigner";

interface IForm {
  tokenA: string;
  tokenB: string;
}

const CreatePairPage: React.FC = () => {
  const getConnectedSigner = useGetConnectedSigner();
  const [tx, setTx] = useState<ContractTransaction | null>(null);
  const { handleChange, handleSubmit, handleBlur, errors, touched } = useFormik(
    {
      initialValues: {
        tokenA: "",
        tokenB: "",
      },
      validate: (values) => {
        const errors: FormikErrors<IForm> = {};

        try {
          getAddress(values.tokenA);
        } catch (e) {
          errors.tokenA = (e as Error).message;
        }

        try {
          getAddress(values.tokenB);
        } catch (e) {
          errors.tokenB = (e as Error).message;
        }

        return errors;
      },
      onSubmit: async (values) => {
        const signer = await getConnectedSigner();
        const factory = signer
          ? UbeswapFactory__factory.connect(FACTORY_ADDRESS, signer)
          : null;
        if (!factory) {
          throw new Error("no factory");
        }
        const tx = await factory.createPair(values.tokenA, values.tokenB, {
          gasPrice: 2 * 10 ** 8,
        });
        console.log(tx);
        setTx(tx);
        console.log("result", await tx.wait());
      },
    }
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Card p={4}>
          <Heading pb="sm">Create Ubeswap Pair</Heading>
          <Input
            my="sm"
            id="tokenA"
            name="tokenA"
            placeholder="Token A address"
            color={touched.tokenA && errors.tokenA ? "red" : "white"}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          {touched.tokenA && errors.tokenA && (
            <Paragraph color="red">{errors.tokenA}</Paragraph>
          )}
          <Input
            my="sm"
            id="tokenB"
            name="tokenB"
            placeholder="Token B address"
            color={touched.tokenB && errors.tokenB ? "red" : "white"}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          {touched.tokenB && errors.tokenB && (
            <Paragraph color="red">{errors.tokenB}</Paragraph>
          )}
          <Button my="sm" type="submit" color="animated">
            Submit
          </Button>
        </Card>
      </form>
    </div>
  );
};

export default CreatePairPage;
