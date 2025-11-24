import { ethers } from "hardhat";

async function main() {
  // 今回デプロイしたアドレス
  const CONTRACT_ADDRESS = "0x2787e4085CC7CB8f95F6D03A19281Ff06D2D1A6e";
  
  // テストするID (例えば 1)
  const TEST_ID = 1;

  const [owner] = await ethers.getSigners();
  console.log(`Testing with account: ${owner.address}`);

  const TsukuroSBT = await ethers.getContractFactory("TsukuroSBT");
  const sbt = TsukuroSBT.attach(CONTRACT_ADDRESS);

  // mintLocked関数の仕様:
  // (address to, uint256 id, uint256 amount, bytes data)
  console.log(`Minting ID ${TEST_ID} to ${owner.address}...`);

  try {
    // 最後の引数 "0x" は data (空のバイトデータ) です
    const tx = await sbt.mintLocked(owner.address, TEST_ID, 1, "0x");
    
    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    
    console.log("✅ Mint Successful!");
    console.log(`Check on Polygonscan: https://amoy.polygonscan.com/tx/${tx.hash}`);

  } catch (error) {
    console.error("❌ Mint Failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});