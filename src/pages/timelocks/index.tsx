import { useRouter } from "next/dist/client/router";
import { useState } from "react";

const Timelocks = () => {
  const router = useRouter();
  const [address, setAddress] = useState<string>("");
  return (
    <div>
      <h1>Enter a Timelock address</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/timelocks/${address}`);
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
