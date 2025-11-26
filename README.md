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

## 📂 Directory Structure
- `contracts/`: Smart Contracts (Hardhat)
- `scripts/`: Deployment & Verification Scripts
- `frontend/`: Next.js Web Application
- `test/`: Contract Tests

## 🚀 Live Demo
[https://main.d2gd2977jraxj2.amplifyapp.com/]

## ✅ Verification Status
- [x] Contract Deployment (Amoy)
- [x] SBT Logic Verification (Locked event)
- [x] IPFS Metadata Integration (ID 1-4)
- [x] Frontend Implementation (Connect Wallet / Mint)
- [x] AWS Deployment