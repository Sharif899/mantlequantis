const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MantleQuantTradeLogger...");
  const Contract = await ethers.getContractFactory("MantleQuantTradeLogger");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("✅ Deployed to:", address);
  console.log("NEXT_PUBLIC_TRADE_LOGGER_ADDRESS =", address);
}

main().catch((e) => { console.error(e); process.exit(1); });