import { task } from "hardhat/config";
import { batchDeploy } from "../src/deploy-sdk";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

task(
  "gelato-deploy",
  "Deploy contracts using the Gelato Deploy SDK (Relay and 1Balance)"
)
  .addParam("contracts", "list of contracts to deploy, separated by commas")
  .addParam("chains", "list of chain names or IDs, separated by commas")
  .setAction(async (args, { ethers }) => {
    const sponsorApiKey = process.env.SPONSOR_KEY;
    if (!sponsorApiKey) throw new Error("Invalid sponsor key in .env");

    const contracts = (args.contracts as string).split(" ");
    const chainIds = (args.chains as string)
      .split(" ")
      .map((x) => (isNaN(Number(x)) ? x : Number(x)));

    for (const name of contracts) {
      const contract = await ethers.getContractFactory(name);

      const { data } = contract.getDeployTransaction(5);
      if (!data) throw new Error("Invalid bytecode");

      const salt = ethers.utils.solidityPack(
        ["bytes32"],
        [ethers.utils.randomBytes(32)]
      );

      const deployments = await batchDeploy(
        data.toString(),
        salt,
        chainIds,
        sponsorApiKey
      );

      console.log(name, deployments);
    }
  });
