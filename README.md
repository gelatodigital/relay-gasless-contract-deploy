# Gasless Contract Deployment

This project demonstrates network-agnostic contract deployment using Relay and 1Balance by introducing the [``deploy-sdk``](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/src/deploy-sdk/index.ts).
Contracts are deployed at the same precomputed address on every network using [``Create2``](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/contracts/Factory.sol#L13).
This eliminates the need for dedicated deployer wallets and native tokens on every network providing a seamless developer experience.

## Implementation
[Implementation](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/tasks/gelato-deploy.ts#L33-L38) is as simple as importing the [``deploy-sdk``](https://github.com/gelatodigital/relay-gasless-contract-deploy/tree/main/src/deploy-sdk) and calling ``batchDeploy``.

```ts
const contracts = await batchDeploy(
  bytecode,
  salt,
  [80001, 5], // Mumbai and Goerli
  sponsorApiKey
);
```

This returns a key-value mapping of chain IDs to deployed contract addresses.  
If a contract fails to deploy, its corresponding address is ``null``.

> [!NOTE]
> A contract may fail to deploy if another contract is already present at the same address or if no factory contract is available on that particular network.

```ts
> console.log(contracts);
{ '5': null, '80001': '0xc8E3726594886ca547fa80cd902A397DDDa2a3Df' }
```

Contract addresses can be precomputed using ``computeAddress``.

```ts
const address = computeAddress(bytecode, salt);
```

## Hardhat Task
Additionally, the example also implements a [``gelato-deploy``](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/tasks/gelato-deploy.ts) hardhat task for contract deployment from the CLI.  
Simply pass a list of contracts to deploy and a list of chains to deploy to (comma-separated).  
[See Quick Start](#quick-start)

## Sponsor API Key
Create an API key allowing 1Balance to handle fee payments across all networks:
1. [Top up 1Balance](https://relay.gelato.network/balance)
2. [Create a Relay App](https://relay.gelato.network/apps/create)
3. Add a contract for each network you wish to deploy to:
   - Select the appropriate network
   - Toggle ``Any contract`` or specify the [``Factory``](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/src/deploy-sdk/constants.ts#L1) contract address
5. Get the API key from the ``API key`` section of your App

## Quick Start
1. Install dependencies
   ```
   yarn install
   ```
2. Compile smart contracts
   ```
   yarn run hardhat compile
   ```
3. Edit ``.env``
   ```
   cp .env.example .env
   ```
7. Deploy [``Counter``](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/contracts/Counter.sol) to Goerli and Mumbai
   ```
   yarn run hardhat gelato-deploy --contracts Counter --chains goerli,mumbai
   ```
