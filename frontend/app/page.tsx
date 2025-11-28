"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x4f38f060388cabAdD37672077Ac97059B67BA2E2";

const ABI = [
  "function mintLocked(address to, uint256 id, uint256 amount, bytes data) external",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function uri(uint256 id) external view returns (string)"
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("-");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [isMinting, setIsMinting] = useState<boolean>(false);
  
  // ★追加: 選択中のIDと、表示用メタデータ
  const [selectedId, setSelectedId] = useState<number>(1);
  const [nftImage, setNftImage] = useState<string>("");
  const [nftName, setNftName] = useState<string>("");
  const [nftDesc, setNftDesc] = useState<string>("");

  // IPFSのURLをHTTPに変換するヘルパー関数
  // ipfs://Qm... -> https://ipfs.io/ipfs/Qm...
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

  // ★追加: メタデータ(画像など)を取得する関数
  const fetchMetadata = async () => {
    try {
      // 読み取り専用プロバイダ（MetaMask不要で読めるように公共RPCを使う手もあるが、今回はMetaMask経由）
      // ※未接続でも読めるようにしたい場合はJsonRpcProviderを使うが、簡略化のため(window as any).ethereumがある前提
      if (!(window as any).ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      // 1. コントラクトからURIを取得 (ipfs://Qm.../{id}.json)
      const uri = await contract.uri(selectedId);
      
      // 2. {id} を実際の数字に置換
      // ERC-1155の仕様ではidは16進数だが、Pinata等は単純置換で動く場合が多い。
      // 今回は単純に置換します。
      const jsonUrl = toGateway(uri.replace("{id}", selectedId.toString()));
      
      console.log("Fetching JSON from:", jsonUrl);

      // 3. JSONをフェッチ
      const response = await fetch(jsonUrl);
      const metadata = await response.json();

      // 4. 画面にセット
      setNftName(metadata.name);
      setNftDesc(metadata.description);
      setNftImage(toGateway(metadata.image)); // 画像URLもゲートウェイ経由に

    } catch (error) {
      console.error("Metadata fetch error:", error);
      setNftName("Unknown NFT");
      setNftImage(""); // エラー時は画像なし
    }
  };

  // IDが変わったらメタデータを再取得
  useEffect(() => {
    fetchMetadata();
    checkBalance();
  }, [selectedId, walletAddress]);

  const mintNFT = async () => {
    if (!walletAddress) return;
    setIsMinting(true);
    setStatusMsg("MetaMaskで署名してください...");

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.mintLocked(walletAddress, selectedId, 1, "0x");
      
      setStatusMsg("トランザクション送信中...");
      await tx.wait();
      
      setStatusMsg(`✅ ミント成功！ ID:${selectedId} をゲットしました`);
      checkBalance();

    } catch (error: any) {
      console.error(error);
      setStatusMsg("❌ エラー: " + (error.reason || "ミント失敗"));
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white font-sans py-10">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">NFT Vending Machine</h1>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl px-4">
        
        {/* 左側: プレビューエリア */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center">
          <div className="w-64 h-64 bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-600">
            {nftImage ? (
              <img src={nftImage} alt="NFT Preview" className="object-cover w-full h-full" />
            ) : (
              <p className="text-gray-500 animate-pulse">Loading Image...</p>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">{nftName || `NFT #${selectedId}`}</h2>
          <p className="text-gray-400 text-center text-sm">{nftDesc}</p>
        </div>

        {/* 右側: 操作エリア */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl border border-gray-700">
          
          {/* ID選択ボタン */}
          <p className="mb-2 font-bold">Select Design:</p>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((id) => (
              <button
                key={id}
                onClick={() => setSelectedId(id)}
                className={`w-12 h-12 rounded-lg font-bold border ${
                  selectedId === id
                    ? "bg-blue-600 border-blue-400 text-white"
                    : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"
                }`}
              >
                {id}
              </button>
            ))}
          </div>

          {walletAddress ? (
            <div>
              <p className="text-green-400 text-sm mb-4">● Wallet Connected</p>
              
              <div className="bg-gray-900 p-4 rounded-lg mb-6">
                <p className="text-gray-400 text-sm">Your Balance (ID:{selectedId}):</p>
                <p className="text-3xl font-bold text-yellow-400">{balance}</p>
              </div>

              <button
                onClick={mintNFT}
                disabled={isMinting}
                className={`w-full font-bold py-4 px-8 rounded-xl transition-all shadow-lg ${
                  isMinting 
                    ? "bg-gray-600 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105"
                }`}
              >
                {isMinting ? "Processing..." : `Mint NFT #${selectedId}`}
              </button>

              {statusMsg && (
                <p className="mt-4 text-center text-sm text-cyan-300">
                  {statusMsg}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl"
            >
              Connect Wallet to Mint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}