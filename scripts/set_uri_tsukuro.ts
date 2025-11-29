import { ethers } from "hardhat";

async function main() {
  // 今回デプロイしたTsukuroSBTのアドレス
  const CONTRACT_ADDRESS = "0x9879d20A2730d0C7512f2F306FC9F333E4F50853";
  
  // ★ここにPinataで取得したフォルダのCIDを入れてください
  const FOLDER_CID = "bafybeifftoo2s4nwt4kvtnrhmgmv5z4joy5vjmnbegska3cky4kjeexwmm";
  
  // チームコードも {id}.json 形式に対応しているため、この形式でOK
  const newURI = `ipfs://${FOLDER_CID}/{id}.json`;

  console.log(`Setting new URI to: ${newURI}`);

  const TsukuroSBT = await ethers.getContractFactory("TsukuroSBT");
  const sbt = TsukuroSBT.attach(CONTRACT_ADDRESS);

  // setURI実行
  const tx = await (sbt as any).setURI(newURI);
  
  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  
  console.log("✅ URI Updated Successfully!");
  console.log(`Check ID 1: https://testnet.rarible.com/token/polygon/${CONTRACT_ADDRESS}:1`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});