import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { Heading } from "theme-ui";

const Timelocks: React.FC = () => {
  const router = useRouter();
  const [address, setAddress] = useState<string>("");
  return (
    <div>
      <Heading as="h1" mb={2}>
        Enter a Timelock address
      </Heading>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void router.push(`/timelocks/${address}`);
        }}
      >
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button type="submit">Go!</button>
      </form>
    </div>
  );
};

export default Timelocks;
