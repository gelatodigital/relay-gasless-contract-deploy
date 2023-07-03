# Gasless Contract Deployment

This project demonstrates network-agnostic contract deployment using Relay and 1Balance by introducing the [``deploy-sdk``](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/src/deploy-sdk/index.ts).
Contracts are deployed at the same precomputed address on every network using [``Create2``](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/contracts/Factory.sol#L15).
The need for dedicated deployer wallets and native tokens on every network is eliminated providing a seamless developer experience.

## Implementation
[Implementation](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/tasks/gasless-deploy.ts#L31-L36) is as simple as importing [``deploy-sdk``](https://github.com/gelatodigital/relay-gasless-contract-deploy/tree/main/src/deploy-sdk) and calling ``batchDeploy``.

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

> **Note**  
> This can be the case if a contract is already deployed at the same address or if no factory contract is present on that particular network.

```ts
> console.log(contracts);
{ '5': null, '80001': '0xc8E3726594886ca547fa80cd902A397DDDa2a3Df' }
```

Contract addresses can be precomputed using ``computeAddress``.

```ts
const address = await computeAddress(
  bytecode,
  salt
);
```

## Hardhat Task
The example also implements a [``gasless-deploy``](https://github.com/gelatodigital/relay-gasless-contract-deploy/blob/main/tasks/gasless-deploy.ts) hardhat task for contract deployment from the CLI.  
Simply pass the name of the contract to deploy and a comma-separated list of chain IDs to deploy to.  
[See below](#quick-start)

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
   yarn run hardhat gasless-deploy --contract Counter --chains 5,80001
   ```
