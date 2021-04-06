import styled from "@emotion/styled";
import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { getAddress, Interface, parseEther } from "ethers/lib/utils";
import { useFormik } from "formik";
import { useState } from "react";
import ITimelockABI from "../../../abis/ITimelock.json";
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
   * Call data
   */
  data: BytesLike;
  /**
   * Minimum timestamp for the call to be executed.
   */
  eta: BigNumberish;
}

type Form = { [key in keyof ContractCall]: string };

export const TransactionBuilder = () => {
  const [abi, setAbi] = useState<Interface | null>(new Interface(ITimelockABI));

  const formik = useFormik<Form>({
    initialValues: {
      target: "",
      value: "",
      signature: "",
      data: "",
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
      alert(JSON.stringify(values, null, 2));
    },
  });
  return (
    <Form onSubmit={formik.handleSubmit}>
      <Field>
        <label htmlFor="target">Target contract address</label>
        <input
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
        <label htmlFor="value">Value</label>
        <input
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
        <label htmlFor="signature">Method signature</label>
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
          <input
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
        <label htmlFor="data">Data</label>
        {formik.values.signature ? (
          <TransactionDataBuilder
            method={abi.functions[formik.values.signature]}
            data={formik.values.data}
            onChange={(value) => formik.setFieldValue("data", value)}
          />
        ) : (
          <input
            id="data"
            name="data"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.data}
          />
        )}
        {formik.touched.data && formik.errors.data && (
          <ErrorMessage>{formik.errors.data}</ErrorMessage>
        )}
      </Field>
      <Field>
        <label htmlFor="eta">Eta</label>
        <input
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
