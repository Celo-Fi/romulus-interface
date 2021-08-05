export const truncateAddress = (addr: string): string =>
  addr.slice(0, 6) + "..." + addr.slice(addr.length - 4);
