import { Button, ButtonProps } from "@theme-ui/components";
import React, { useState } from "react";
import { CgSpinner } from "react-icons/cg";

import { handleException } from "../../util/handleException";

interface Props extends ButtonProps {
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void | Promise<void>;
  errorTitle?: string;
}

/**
 * Button that handles an async task on click, capturing errors.
 * @returns
 */
export const AsyncButton: React.FC<Props> = ({
  onClick,
  errorTitle,
  children,
  disabled,
  ...restProps
}: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <Button
      {...restProps}
      disabled={disabled || loading}
      onClick={
        onClick
          ? async (e) => {
              setLoading(true);
              try {
                await onClick?.(e);
              } catch (err) {
                handleException(err, {
                  userMessage: errorTitle
                    ? {
                        title: errorTitle,
                      }
                    : undefined,
                });
              }
              setLoading(false);
            }
          : undefined
      }
    >
      <div tw="flex items-center gap-3">
        {children}
        {loading && <CgSpinner tw="animate-spin" />}
      </div>
    </Button>
  );
};
