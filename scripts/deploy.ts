import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const myNft = await hre.ethers.deployContract("MyNFT", [deployer.address]);

  await myNft.waitForDeployment();

  console.log(
    `MyNFT contract deployed to ${myNft.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});