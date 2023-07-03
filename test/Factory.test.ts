import { deployments, ethers } from "hardhat";
import { Counter__factory, Factory } from "../typechain";
import { assert, expect } from "chai";

describe("Deploy", () => {
  let factory: Factory;
  let address: string;
  let bytecode: string;

  const salt = "0x" + "a".repeat(64);

  before(async () => {
    await deployments.fixture();

    const { address: factoryAddress } = await deployments.get("Factory");

    factory = (await ethers.getContractAt(
      "Factory",
      factoryAddress
    )) as Factory;

    const counter = (await ethers.getContractFactory(
      "Counter"
    )) as Counter__factory;

    const { data } = counter.getDeployTransaction(5);
    if (!data) assert.fail("Invalid bytecode");

    bytecode = data.toString();
  });

  it("Should compute Create2 address", async () => {
    const computedAddress = ethers.utils.getCreate2Address(
      factory.address,
      salt,
      ethers.utils.solidityKeccak256(["bytes"], [bytecode])
    );

    const expectedAddress = await factory.computeAddress(bytecode, salt);

    expect(computedAddress).to.equal(expectedAddress);
    address = computedAddress;
  });

  it("Should deploy Counter", async () => {
    const tx = await factory.deploy(bytecode, salt);
    const receipt = await tx.wait();

    if (!receipt.events) assert.fail("No events");

    const event = receipt.events[0];
    expect(event.args?.addr).to.equal(address);
  });
});
