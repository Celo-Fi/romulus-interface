import styled from "@emotion/styled";
import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike, getAddress, Interface, parseEther } from "ethers/lib/utils";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Input, Label, Textarea } from "theme-ui";

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
}

export const TransactionBuilder: React.FC<Props> = ({
  abi: providedAbi,
  hasEta,
  onSubmit,
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
      <Field>
        <Label htmlFor="target">Target contract address</Label>
        <Input
          id="target"
          name="target"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.target}
          placeholder="0x0000000000000000000000000000000000000000"
        />
        {formik.touched.target && formik.errors.target && (
          <ErrorMessage>{formik.errors.target}</ErrorMessage>
        )}
      </Field>
      <Field>
        <Label htmlFor="abi">ABI</Label>
        <Textarea
          id="abi"
          name="abi"
          onChange={(e) => {
            setAbi(new Interface(e.target.value));
          }}
          value={abi ? JSON.stringify(abi.fragments, null, 2) : ""}
        />
      </Field>
      <Field>
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
      </Field>
      <Field>
        <Label htmlFor="signature">Method signature</Label>
        {abi ? (
          <select
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
          </select>
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
      </Field>
      <Field>
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
      </Field>
      {hasEta && (
        <Field>
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
        </Field>
      )}
      {functionFragment && (
        <Field>
          <h3>Preview</h3>
          <FunctionWithArgs frag={functionFragment} args={formik.values.args} />
        </Field>
      )}
      <Field>
        <button type="submit">Submit</button>
      </Field>
    </Form>
  );
};

const Form = styled.form`
  display: grid;
  grid-row-gap: 16px;
`;

const Field = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 16px;
`;

const ErrorMessage = styled.div`
  color: red;
`;
