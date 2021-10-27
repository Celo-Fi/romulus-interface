import { Contract, EventFilter } from "ethers";

export const getPastEvents = async <T>(
  contract: Contract,
  filter: EventFilter,
  fromBlock: number,
  toBlock: number
) => {
  const events = [];
  const bucketSize = 100_000;
  for (
    let i = Math.floor(fromBlock / bucketSize);
    i < Math.ceil(toBlock / bucketSize);
    i++
  ) {
    events.push(
      ...(await contract.queryFilter(
        filter,
        Math.max(i * bucketSize, fromBlock),
        Math.min((i + 1) * bucketSize, toBlock)
      ))
    );
  }
  return events as unknown as T[];
};
