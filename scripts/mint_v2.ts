import { ethers } from "hardhat";

async function main() {
  // 1. 以前デプロイしたコントラクトのアドレス
  const CONTRACT_ADDRESS = "0x2741698D5C0d1deBfC52Eb36726B47ADf507e04F";

  // 2. 実行アカウントの取得（.envのPRIVATE_KEYが使われます）
  const [owner] = await ethers.getSigners();
  console.log(`Minting with account: ${owner.address}`);

  // 3. コントラクトへの接続
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = MyNFT.attach(CONTRACT_ADDRESS);

  // 4. メタデータの設定
  // ★★★ ここを書き換えてください ★★★
  // 例: "ipfs://QmXyz123abc..." 
  // 必ず先頭に "ipfs://" を付けてください
  const tokenURI = "ipfs://bafkreics3i6xelzocnkszihp4wyhoqblfylgqywnz5iecoya5nkrsd6o7q"; 

  const toAddress = owner.address; // 自分自身のウォレットにミント

  console.log("----------------------------------------");
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`TokenURI: ${tokenURI}`);
  console.log("Minting SBT in progress...");

  // 5. safeMint関数の実行
  try {
    const tx = await myNFT.safeMint(toAddress, tokenURI);
    console.log("Transaction sent. Waiting for confirmation...");
    
    // トランザクション完了待ち
    await tx.wait();
    
    console.log("----------------------------------------");
    console.log("✅ Mint Successful!");
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(`Check at: https://amoy.polygonscan.com/tx/${tx.hash}`);
    console.log("----------------------------------------");

  } catch (error) {
    console.error("❌ Mint Failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});