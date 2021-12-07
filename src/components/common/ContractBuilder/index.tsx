import styled from "@emotion/styled";
import { BytesLike, Interface } from "ethers/lib/utils";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Card, Flex, Heading, Input, Label, Select } from "theme-ui";

import { FunctionWithArgs } from "../FunctionWithArgs";
import { deployableContracts } from "./deployableContracts";
import { TransactionDataBuilder } from "./TransactionDataBuilder";

interface ContractDeploy {
  contractName: string;
  args?: readonly unknown[];
}

type Form = Omit<{ [key in keyof ContractDeploy]: string }, "args"> & {
  args?: readonly unknown[];
};

interface Props {
  onSubmit: (args: {
    bytecode: string;
    abi: Interface;
    args: readonly unknown[];
  }) => void;
  onCancel?: () => void;
}

export const ContractBuilder: React.FC<Props> = ({
  onSubmit,
  onCancel,
}: Props) => {
  const [abi, setAbi] = useState<Interface | undefined>();

  const formik = useFormik<Form>({
    initialValues: {
      contractName: "MoolaStakingRewards",
      args: [],
    },
    validate: () => {
      const errors: { [key in keyof ContractDeploy]?: string } = {};
      return errors;
    },
    onSubmit: (values) => {
      const deployableContract =
        deployableContracts[formik.values.contractName];
      if (!deployableContract) {
        throw new Error("Invalid deployable contract");
      }
      if (!abi) {
        throw new Error("no abi");
      }
      const fragment = abi.deploy;
      if (!fragment) {
        throw new Error("Undefined deploy fragment");
      }
      const { args } = values;
      if (!args) {
        throw new Error("Undefined args");
      }
      onSubmit({
        ...deployableContract,
        args,
      });
    },
  });
  useEffect(() => {
    setAbi(deployableContracts[formik.values.contractName]?.abi);
  }, [formik.values.contractName]);

  const functionFragment = abi?.deploy;

  return (
    <Form onSubmit={formik.handleSubmit}>
      <Label htmlFor="contract">Contract</Label>
      <Select
        id="contract"
        name="contractName"
        onChange={formik.handleChange}
        value={formik.values.contractName}
      >
        {Object.keys(deployableContracts).map((contractName) => (
          <option key={contractName} value={contractName}>
            {contractName}
          </option>
        ))}
      </Select>
      {formik.touched.contractName && formik.errors.contractName && (
        <ErrorMessage>{formik.errors.contractName}</ErrorMessage>
      )}
      <Label htmlFor="args">Arguments</Label>
      {abi && functionFragment ? (
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
