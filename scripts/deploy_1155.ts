import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TeamSBT (ERC-1155)...");

  // デプロイ実行
  const TeamSBT = await ethers.getContractFactory("TeamSBT");
  const teamSBT = await TeamSBT.deploy();

  await teamSBT.waitForDeployment();

  const address = await teamSBT.getAddress();
  console.log(`TeamSBT deployed to: ${address}`);
  
  // 検証用コマンドの出力（後で使います）
  console.log("Wait a minute, then verify with:");
  console.log(`npx hardhat verify --network amoy ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});