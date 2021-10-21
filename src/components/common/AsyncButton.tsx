import { Button, ButtonProps } from "@theme-ui/components";

import { handleException } from "../../util/handleException";

interface Props extends ButtonProps {
  onClick?: () => Promise<void>;
}

export const AsyncButton: React.FC<Props> = ({
  onClick,
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
                handleException(e);
              }
            }
          : undefined
      }
    />
  );
};
