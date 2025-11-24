import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x2787e4085CC7CB8f95F6D03A19281Ff06D2D1A6e";
  const [owner] = await ethers.getSigners();
  const TsukuroSBT = await ethers.getContractFactory("TsukuroSBT");
  const sbt = TsukuroSBT.attach(CONTRACT_ADDRESS);

  // ID 2, 3, 4 を順番にミント
  const targetIds = [2, 3, 4];

  console.log(`Minting ID ${targetIds.join(", ")} to ${owner.address}...`);

  for (const id of targetIds) {
    try {
      console.log(`Minting ID: ${id}...`);
      const tx = await sbt.mintLocked(owner.address, id, 1, "0x");
      await tx.wait();
      console.log(`✅ ID ${id} Minted!`);
    } catch (e) {
      console.error(`❌ ID ${id} Failed:`, e);
    }
  }
  
  console.log("All done! Check Rarible.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});