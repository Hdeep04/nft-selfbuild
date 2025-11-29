import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// 環境変数から読み込み
const PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// ABI (必要な部分のみ)
const ABI = [
  "function mintLocked(address to, uint256 id, uint256 amount, bytes data) external"
];

export async function POST(request: Request) {
  try {
    // 1. リクエストからデータを取り出す
    const body = await request.json();
    const { userAddress, tokenId } = body;

    if (!userAddress || !tokenId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    console.log(`Processing mint for ${userAddress} (ID: ${tokenId})...`);

    // 2. プロバイダとウォレットの準備 (Amoy)
    const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    // 3. ガス代推定 (オプションだが安全のため)
    // const feeData = await provider.getFeeData();

    // 4. ミント実行 (運営がガス代を払う)
    // mintLocked(to, id, amount, data)
    const tx = await contract.mintLocked(userAddress, tokenId, 1, "0x");
    
    console.log(`Tx Sent: ${tx.hash}`);

    // 5. 完了待ち (待たずに返す手もあるが、今回は確実に待つ)
    await tx.wait();

    // 6. 成功レスポンス
    return NextResponse.json({ success: true, txHash: tx.hash });

  } catch (error: any) {
    console.error("Mint Error:", error);
    // エラー内容を返す (Already minted など)
    return NextResponse.json({ error: error.reason || error.message || "Mint failed" }, { status: 500 });
  }
}