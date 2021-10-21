import React from "react";

interface Props {
  data: Record<string, React.ReactNode | null | undefined>;
}

export const AttributeList: React.FC<Props> = ({ data }: Props) => (
  <div tw="grid gap-2">
    {Object.entries(data).map(([k, v]) => {
      return (
        <div key={k} tw="flex justify-between">
          <div tw="text-gray-300">{k}</div>
          {v ? (
            <div>{v}</div>
          ) : (
            <div tw="text-gray-400">
              {v === null ? "(null)" : v === undefined ? "(undefined)" : v}
            </div>
          )}
        </div>
      );
    })}
  </div>
);
