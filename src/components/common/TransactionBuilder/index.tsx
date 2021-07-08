import styled from "@emotion/styled";
import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike, getAddress, Interface, parseEther } from "ethers/lib/utils";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Flex,
  Heading,
  Input,
  Label,
  Select,
  Textarea,
} from "theme-ui";

import { useAbi } from "../../../hooks/useAbi";
import { FunctionWithArgs } from "../FunctionWithArgs";
import { TransactionDataBuilder } from "./TransactionDataBuilder";

interface ContractCall {
  /**
   * Target contract address.
   */
  target: string;
  /**
   * Call value
   */
  value: BigNumberish;
  /**
   * Call method signature
   */
  signature: string;
  /**
   * Unencoded function args
   */
  args?: readonly unknown[];
  /**
   * Minimum timestamp for the call to be executed.
   */
  eta: BigNumberish;
}

type Form = Omit<{ [key in keyof ContractCall]: string }, "args"> & {
  args?: readonly unknown[];
};

interface Props {
  abi?: Interface;
  hasEta?: boolean;
  onSubmit: (args: {
    call: ContractCall;
    data: BytesLike;
    encodedParams: BytesLike;
  }) => void;
  onCancel?: () => void;
}

export const TransactionBuilder: React.FC<Props> = ({
  abi: providedAbi,
  hasEta,
  onSubmit,
  onCancel,
}: Props) => {
  const [abi, setAbi] = useState<Interface | null>(providedAbi ?? null);

  const formik = useFormik<Form>({
    initialValues: {
      target: "",
      value: "",
      signature: "",
      args: [],
      eta: "",
    },
    validate: (values) => {
      const errors: { [key in keyof ContractCall]?: string } = {};
      try {
        getAddress(values.target);
      } catch (e) {
        errors.target = "Invalid address";
      }

      if (values.value) {
        try {
          parseEther(values.value);
        } catch (e) {
          errors.value = "Invalid value";
        }
      }

      return errors;
    },
    onSubmit: (values) => {
      if (!abi) {
        throw new Error("no abi");
      }
      const fragment = abi.functions[values.signature];
      if (!fragment) {
        throw new Error("unknown fragment: " + values.signature);
      }
      const { args } = values;
      const data = abi.encodeFunctionData(fragment, args ?? []);
      const encodedParams = abi._encodeParams(fragment.inputs, args ?? []);
      onSubmit({
        call: {
          ...values,
          value: values.value || 0,
          eta: values.eta
            ? Math.floor(new Date(values.eta).getTime() / 1000)
            : 0,
        },

        data,
        encodedParams,
      });
    },
  });
  const dynamicAbi = useAbi(formik.values.target);
  useEffect(() => {
    if (dynamicAbi) {
      setAbi(dynamicAbi);
    }
  }, [dynamicAbi]);

  const functionFragment = abi?.functions[formik.values.signature];

  return (
    <Form onSubmit={formik.handleSubmit}>
      <Label htmlFor="target">Target</Label>
      <Input
        id="target"
        name="target"
        type="text"
        onChange={formik.handleChange}
        value={formik.values.target}
        placeholder="Enter contract address"
      />
      {formik.touched.target && formik.errors.target && (
        <ErrorMessage>{formik.errors.target}</ErrorMessage>
      )}
      <Label htmlFor="abi">ABI</Label>
      <Textarea
        id="abi"
        name="abi"
        onChange={(e) => {
          setAbi(new Interface(e.target.value));
        }}
        value={abi ? JSON.stringify(abi.fragments, null, 2) : ""}
      />
      <Label htmlFor="value">Value</Label>
      <Input
        id="value"
        name="value"
        type="text"
        onChange={formik.handleChange}
        value={formik.values.value}
        placeholder="0.0"
      />
      {formik.touched.value && formik.errors.value && (
        <ErrorMessage>{formik.errors.value}</ErrorMessage>
      )}
      <Label htmlFor="signature">Method signature</Label>
      {abi ? (
        <Select
          id="signature"
          name="signature"
          onChange={formik.handleChange}
          value={formik.values.signature}
        >
          {Object.entries(abi.functions).map(([signature, fragment]) => (
            <option key={signature} value={signature}>
              {fragment.format("sighash")}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          id="signature"
          name="signature"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.signature}
        />
      )}
      {formik.touched.signature && formik.errors.signature && (
        <ErrorMessage>{formik.errors.signature}</ErrorMessage>
      )}
      <Label htmlFor="args">Arguments</Label>
      {formik.values.signature && abi && functionFragment ? (
        <TransactionDataBuilder
          method={functionFragment}
          args={formik.values.args}
          onChange={(value) => formik.setFieldValue("args", value)}
        />
      ) : (
        <Input
          id="args"
          name="args"
          type="text"
          onChange={formik.handleChange}
          value={JSON.stringify(formik.values.args)}
        />
      )}
      {formik.touched.args && formik.errors.args && (
        <ErrorMessage>{formik.errors.args}</ErrorMessage>
      )}
      {hasEta && (
        <>
          <Label htmlFor="eta">Eta</Label>
          <Input
            id="eta"
            name="eta"
            type="datetime-local"
            onChange={formik.handleChange}
            value={formik.values.eta}
          />
          {formik.touched.eta && formik.errors.eta && (
            <ErrorMessage>{formik.errors.eta}</ErrorMessage>
          )}
        </>
      )}
      {functionFragment && (
        <>
          <Heading as="h3">Preview</Heading>
          <Card p={[3, 4]}>
            <FunctionWithArgs
              frag={functionFragment}
              args={formik.values.args}
            />
          </Card>
        </>
      )}
      <Flex sx={{ justifyContent: "center" }}>
        {onCancel && (
          <Button variant="outline" mr={2} onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Submit</Button>
      </Flex>
    </Form>
  );
};

const Form = styled.form`
  display: grid;
  grid-row-gap: 16px;
`;

const ErrorMessage = styled.div`
  color: red;
`;
