import { ethers } from "hardhat";

async function main() {
  // デプロイ済みのコントラクトアドレス
  const CONTRACT_ADDRESS = "0x77a56EeAa354B2BBd9779D77c6F4Ab496d5c086C";
  
  // ★ここにフォルダのCIDを入れてください
  const FOLDER_CID = "bafybeiad7cihrpsyvnikcwhxrssmt757akcn7fmkr7dx4sm2yfest3zwiu";
  
  // ERC-1155の仕様通り、末尾に /{id}.json を付けます
  const newURI = `ipfs://${FOLDER_CID}/{id}.json`;

  console.log(`Setting new URI to: ${newURI}`);

  const [owner] = await ethers.getSigners();
  const TeamSBT = await ethers.getContractFactory("TeamSBT");
  const teamSBT = TeamSBT.attach(CONTRACT_ADDRESS);

  // setURI関数の実行
  const tx = await teamSBT.setURI(newURI);
  
  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  
  console.log("✅ URI Updated Successfully!");
  console.log(`Check on OpenSea Testnet: https://testnets.opensea.io/assets/amoy/${CONTRACT_ADDRESS}/1`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});