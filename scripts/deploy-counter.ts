import { ethers } from "hardhat";
import { Counter__factory } from "../typechain";
import { batchDeploy } from "../src/deploy-sdk";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const main = async () => {
  const counter = (await ethers.getContractFactory(
    "Counter"
  )) as Counter__factory;

  const { data } = counter.getDeployTransaction(5);
  if (!data) throw new Error("Invalid bytecode");

  const bytecode = data.toString();

  const salt = ethers.utils.solidityPack(
    ["bytes32"],
    [ethers.utils.randomBytes(32)]
  );

  const sponsorApiKey = process.env.SPONSOR_KEY;
  if (!sponsorApiKey) throw new Error("Invalid sponsor key in .env");

  const contracts = await batchDeploy(
    bytecode,
    salt,
    [80001, 5], // Mumbai and Goerli
    sponsorApiKey
  );

  console.log(contracts);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
