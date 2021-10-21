import { Button, ButtonProps } from "@theme-ui/components";

import { handleException } from "../../util/handleException";

interface Props extends ButtonProps {
  onClick?: () => Promise<void>;
  errorTitle?: string;
}

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
          ? async () => {
              try {
                await onClick?.();
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
