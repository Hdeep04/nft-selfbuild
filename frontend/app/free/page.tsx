"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

// コントラクトアドレス
const CONTRACT_ADDRESS = "0x9879d20A2730d0C7512f2F306FC9F333E4F50853";

const ABI = [
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function uri(uint256 id) external view returns (string)"
];

export default function FreeMintPage() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("-");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [isMinting, setIsMinting] = useState<boolean>(false); // 追加: ローディング状態
  const [selectedId, setSelectedId] = useState<number>(1);
  const [nftImage, setNftImage] = useState<string>("");
  const [nftName, setNftName] = useState<string>("");
  const [nftDesc, setNftDesc] = useState<string>("");

  const toGateway = (url: string) => {
    if (!url || !url.startsWith("ipfs://")) return url;
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) return;
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }],
        });
      } catch (e) { console.error(e); }
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
    } catch (error) { console.error(error); }
  };

  const checkBalance = async () => {
    if (!walletAddress) return;
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const bal = await contract.balanceOf(walletAddress, selectedId);
      setBalance(bal.toString());
    } catch (error) { console.error(error); }
  };

  const fetchMetadata = async () => {
    try {
      if (!(window as any).ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const uri = await contract.uri(selectedId);
      const jsonUrl = toGateway(uri.replace("{id}", selectedId.toString()));
      const response = await fetch(jsonUrl);
      const metadata = await response.json();
      setNftName(metadata.name);
      setNftDesc(metadata.description);
      setNftImage(toGateway(metadata.image));
    } catch (error) {
      setNftName(`NFT #${selectedId}`);
      setNftImage(""); 
    }
  };

  useEffect(() => {
    fetchMetadata();
    checkBalance();
  }, [selectedId, walletAddress]);

  // ★無料ミント用関数（バックエンド呼び出し）
  const mintFreeNFT = async () => {
    if (!walletAddress) return;
    setIsMinting(true);
    setStatusMsg("⏳ バックエンドにリクエスト送信中...");
    
    try {
      const response = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: walletAddress,
          tokenId: selectedId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Mint failed");
      }

      console.log("Success:", data.txHash);
      setStatusMsg("✅ ミント成功！ 運営がガス代を負担しました");
      checkBalance();

    } catch (error: any) {
      console.error(error);
      setStatusMsg(`❌ エラー: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white font-sans py-10">
      <div className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold mb-4 animate-bounce">
        ✨ 会場限定・ガス代無料キャンペーン中 ✨
      </div>
      <h1 className="text-4xl font-bold mb-8 text-green-400">Free NFT Mint</h1>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl px-4">
        {/* 左側: プレビュー */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center shadow-2xl">
          <div className="w-64 h-64 bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-600">
            {nftImage ? <img src={nftImage} className="object-cover w-full h-full" /> : <p className="text-gray-500">Loading...</p>}
          </div>
          <h2 className="text-2xl font-bold mb-2">{nftName}</h2>
          <p className="text-gray-400 text-center text-sm">{nftDesc}</p>
        </div>

        {/* 右側: 操作パネル */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl border border-green-500 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-bold px-2 py-1">FREE</div>

          <p className="mb-2 font-bold text-gray-300">Select Design:</p>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((id) => (
              <button key={id} onClick={() => setSelectedId(id)} className={`w-12 h-12 rounded-lg font-bold border ${selectedId === id ? "bg-green-600 border-green-400" : "bg-gray-700 border-gray-600"}`}>{id}</button>
            ))}
          </div>

          {walletAddress ? (
            <div>
              <div className="mb-4 text-sm">Wallet: <span className="font-mono text-green-400">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</span></div>
              <p className="text-xl font-bold mb-4">{balance === "1" ? "✅ 取得済み" : "未取得"}</p>
              
              <button
                onClick={mintFreeNFT}
                disabled={isMinting || balance === "1"}
                className={`w-full font-bold py-4 px-8 rounded-xl transition-all shadow-lg ${
                  isMinting || balance === "1"
                    ? "bg-gray-600 cursor-not-allowed text-gray-400" 
                    : "bg-green-600 hover:bg-green-500 text-white shadow-green-500/30"
                }`}
              >
                {isMinting 
                  ? "Processing..." 
                  : balance === "1" 
                    ? "Already Minted" 
                    : `Free Mint NFT #${selectedId}`
                }
              </button>
              <p className="mt-2 text-xs text-center text-gray-400">※運営がガス代を負担します</p>
              
              {statusMsg && (
                <p className={`mt-4 text-center text-sm ${statusMsg.includes("エラー") ? "text-red-400" : "text-yellow-300"}`}>
                  {statusMsg}
                </p>
              )}
            </div>
          ) : (
            <button onClick={connectWallet} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl">Connect Wallet</button>
          )}
        </div>
      </div>
    </div>
  );
}