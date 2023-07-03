import { task } from "hardhat/config";
import { batchDeploy } from "../src/deploy-sdk";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

task(
  "gasless-deploy",
  "Deploys a contract using the Deploy SDK (Relay and 1Balance)"
)
  .addParam("contract", "The name of the contract")
  .addParam("chains", "Comma-separated list of chain IDs")
  .setAction(async (args, { ethers }) => {
    const contract = await ethers.getContractFactory(args.contract as string);

    const { data } = contract.getDeployTransaction(5);
    if (!data) throw new Error("Invalid bytecode");

    const bytecode = data.toString();

    const salt = ethers.utils.solidityPack(
      ["bytes32"],
      [ethers.utils.randomBytes(32)]
    );

    const sponsorApiKey = process.env.SPONSOR_KEY;
    if (!sponsorApiKey) throw new Error("Invalid sponsor key in .env");

    const chainIds = (args.chains as string).split(" ").map((x) => parseInt(x));

    const contracts = await batchDeploy(
      bytecode,
      salt,
      chainIds,
      sponsorApiKey
    );

    console.log(contracts);
  });
