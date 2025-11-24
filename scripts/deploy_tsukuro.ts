import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TsukuroSBT (Official Spec)...");

  // コントラクトファクトリーを取得
  const TsukuroSBT = await ethers.getContractFactory("TsukuroSBT");
  
  // デプロイ実行
  const tsukuroSBT = await TsukuroSBT.deploy();
  await tsukuroSBT.waitForDeployment();

  const address = await tsukuroSBT.getAddress();
  
  console.log("----------------------------------------------------");
  console.log(`✅ TsukuroSBT deployed to: ${address}`);
  console.log("----------------------------------------------------");
  console.log("To verify, run:");
  console.log(`npx hardhat verify --network amoy ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});