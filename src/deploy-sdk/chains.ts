const chains: { name: string; id: number }[] = [
  { name: "goerli", id: 5 },
  { name: "mumbai", id: 80001 },
];

const getChainId = (name: string): number | undefined =>
  chains.find((x) => x.name === name)?.id;

const isSupported = (chainId: number): boolean =>
  chains.find((x) => x.id === chainId) !== undefined;

export { getChainId, isSupported };
