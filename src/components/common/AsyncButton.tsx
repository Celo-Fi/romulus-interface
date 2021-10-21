import { Button, ButtonProps } from "@theme-ui/components";

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
  ...restProps
}: Props) => {
  return (
    <Button
      {...restProps}
      onClick={
        onClick
          ? async (e) => {
              try {
                await onClick?.(e);
              } catch (e) {
                handleException(e, {
                  userMessage: errorTitle
                    ? {
                        title: errorTitle,
                      }
                    : undefined,
                });
              }
            }
          : undefined
      }
    />
  );
};
