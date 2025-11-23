import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("MyNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMyNftFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MyNFT = await hre.ethers.getContractFactory("MyNFT");
    const myNft = await MyNFT.deploy(owner.address);

    return { myNft, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { myNft, owner } = await loadFixture(deployMyNftFixture);

      expect(await myNft.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint a new NFT to the specified address", async function () {
      const { myNft, owner, otherAccount } = await loadFixture(deployMyNftFixture);
      const tokenURI = "https://example.com/nft1.json";

      // Mint a new token to 'otherAccount'
      await myNft.connect(owner).safeMint(otherAccount.address, tokenURI);

      // Check the owner of the new token
      expect(await myNft.ownerOf(0)).to.equal(otherAccount.address);
      // Check the token URI of the new token
      expect(await myNft.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should fail if a non-owner tries to mint", async function () {
      const { myNft, otherAccount } = await loadFixture(deployMyNftFixture);
      const tokenURI = "https://example.com/nft2.json";

      // Expect the transaction to be reverted with a specific error message
      await expect(
        myNft.connect(otherAccount).safeMint(otherAccount.address, tokenURI)
      ).to.be.revertedWithCustomError(myNft, "OwnableUnauthorizedAccount");
    });
  });
  describe("Transfers", function () {
    it("Should fail when trying to transfer a token", async function () {
      const { myNft, owner, otherAccount } = await loadFixture(deployMyNftFixture);
      const tokenURI = "https://example.com/sbt.json";

      // Mint a token to the owner first
      await myNft.connect(owner).safeMint(owner.address, tokenURI);
      const tokenId = 0;

      // Expect the transfer transaction to be reverted
      await expect(
        myNft.connect(owner).transferFrom(owner.address, otherAccount.address, tokenId)
      ).to.be.revertedWith("ERC721: token transfer is disabled");
    });
  });
   describe("SBT Interface (IERC5192)", function () {
    it("Should be locked", async function () {
      const { myNft, owner } = await loadFixture(deployMyNftFixture);
      
      // ミントする
      await myNft.connect(owner).safeMint(owner.address, "https://example.com/sbt.json");
      const tokenId = 0;

      // locked関数を呼び出して、trueが返ってくるか確認する
      expect(await myNft.locked(tokenId)).to.equal(true);
    });
  });
});