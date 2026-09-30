import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("Deploying OcearaMRVRegistry...");

  const Registry = await ethers.getContractFactory("OcearaMRVRegistry");

  const registry = await Registry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();

  console.log("OcearaMRVRegistry deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});