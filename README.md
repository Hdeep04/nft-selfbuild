# NFT Self-Build Project

東京大学ブロックチェーン講座コミュニティ企画「みんなでNFT作ろう」に向けた、個人検証用プロジェクトです。
チーム公式仕様のコントラクトを使用し、デプロイからフロントエンド実装までを検証しています。

## 🛠 Tech Stack
- **Blockchain**: Polygon Amoy Testnet
- **Contract**: Solidity (ERC-1155 + IERC5192 Soulbound)
  - Based on: `TsukuroSBT.sol` (Official Team Spec)
  - Tool: Hardhat
- **Frontend**: Next.js (TypeScript) + ethers.js
- **Storage**: IPFS (Pinata)
- **Deployment**: AWS Amplify

## 🚀 Live Demo
- **通常版 (Public Mint)**: https://main.d2gd2977jraxj2.amplifyapp.com/
  - ガス代: ユーザー負担
  - 対象: 一般公開用
- **会場限定版 (Gasless Mint)**: https://main.d2gd2977jraxj2.amplifyapp.com/free
  - ガス代: 運営負担 (Backend API経由)
  - 対象: イベント会場用

## ✅ Verification Status
- [x] Contract Deployment (Amoy)
- [x] SBT Logic Fix (2人目ミント可 / 1人1個制限)
- [x] IPFS Metadata Integration (ID 1-4)
- [x] Frontend Implementation (Connect Wallet / Mint)
- [x] Backend API Implementation (Gasless Mint)
- [x] AWS Deployment (CI/CD)