"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

// ★新しいコントラクトアドレス (0x9879...)
const CONTRACT_ADDRESS = "0x9879d20A2730d0C7512f2F306FC9F333E4F50853";

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
      
      console.log("Fetching JSON from:", jsonUrl);

      const response = await fetch(jsonUrl);
      const metadata = await response.json();

      setNftName(metadata.name);
      setNftDesc(metadata.description);
      setNftImage(toGateway(metadata.image));

    } catch (error) {
      console.error("Metadata fetch error:", error);
      setNftName(`NFT #${selectedId}`);
      setNftDesc("Loading or No Data...");
      setNftImage(""); 
    }
  };

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
        
        {/* 左側: プレビュー */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center shadow-2xl">
          <div className="w-64 h-64 bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-600 shadow-inner">
            {nftImage ? (
              <img src={nftImage} alt="NFT Preview" className="object-cover w-full h-full hover:scale-110 transition-transform duration-500" />
            ) : (
              <p className="text-gray-500 animate-pulse">Loading Image...</p>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">{nftName}</h2>
          <p className="text-gray-400 text-center text-sm">{nftDesc}</p>
        </div>

        {/* 右側: 操作パネル */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl">
          
          <p className="mb-2 font-bold text-gray-300">Select Design:</p>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((id) => (
              <button
                key={id}
                onClick={() => { setSelectedId(id); setStatusMsg(""); }}
                className={`w-12 h-12 rounded-lg font-bold border transition-all ${
                  selectedId === id
                    ? "bg-blue-600 border-blue-400 text-white shadow-lg scale-110"
                    : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"
                }`}
              >
                {id}
              </button>
            ))}
          </div>

          {walletAddress ? (
            <div>
              <div className="flex items-center gap-2 mb-4 bg-gray-900 p-3 rounded border border-gray-700">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-gray-400">Connected Wallet:</p>
                  <p className="text-sm font-mono text-white truncate">{walletAddress}</p>
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm mb-2">Status:</p>
                <div className="text-xl font-bold">
                  {balance === "1" ? (
                    <span className="text-green-400 flex items-center justify-center gap-2">
                      ✅ 取得済み (Owned)
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      未取得 (Not owned yet)
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={mintNFT}
                disabled={isMinting || balance === "1"}
                className={`w-full font-bold py-4 px-8 rounded-xl transition-all shadow-lg ${
                  isMinting || balance === "1"
                    ? "bg-gray-600 cursor-not-allowed text-gray-400" 
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 text-white"
                }`}
              >
                {isMinting 
                  ? "Processing..." 
                  : balance === "1" 
                    ? "Already Minted" 
                    : `Mint NFT #${selectedId}`
                }
              </button>

              {statusMsg && (
                <p className={`mt-4 text-center text-sm ${statusMsg.includes("エラー") ? "text-red-400" : "text-cyan-300"}`}>
                  {statusMsg}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
            >
              Connect Wallet to Mint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}