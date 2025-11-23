import { ethers } from "hardhat";

async function main() {
  // 今回デプロイしたアドレス
  const CONTRACT_ADDRESS = "0x77a56EeAa354B2BBd9779D77c6F4Ab496d5c086C";
  // 配布するID (PDF要件の4種類のうちの1つ。今回はID:1)
  const TARGET_ID = 1;

  const [admin] = await ethers.getSigners();
  console.log(`Operating as Backend (Admin): ${admin.address}`);

  const TeamSBT = await ethers.getContractFactory("TeamSBT");
  const teamSBT = TeamSBT.attach(CONTRACT_ADDRESS);

  // airdropMint関数の実行
  // 引数: (配布先アドレス, NFTのID)
  console.log(`Airdropping Token ID ${TARGET_ID} to ${admin.address}...`);
  
  try {
    const tx = await teamSBT.airdropMint(admin.address, TARGET_ID);
    console.log(`Transaction sent: ${tx.hash}`);
    
    await tx.wait();
    console.log("✅ Airdrop Complete! SBT Locked.");
    console.log(`Check: https://amoy.polygonscan.com/tx/${tx.hash}`);
    
  } catch (error) {
    console.error("❌ Airdrop Failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});