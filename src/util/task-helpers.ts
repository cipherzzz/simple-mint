import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

export const deployNFTContract = async (
  taskArgs: TaskArguments,
  hre: HardhatRuntimeEnvironment
): Promise<string> => {
  let [signer] = await hre.ethers.getSigners();
  console.log(`Deployer: ${signer.address}`);
  const nft = await (
    await hre.ethers.getContractFactory("ERC721NFT")
  ).deploy(taskArgs.symbol, taskArgs.description);
  const nftAddress = nft.address;
  console.log(`NFT: deployed to: ${nftAddress}`);
  return nftAddress;
};

export const mintToken = async (
  taskArgs: TaskArguments,
  hre: HardhatRuntimeEnvironment
): Promise<boolean> => {
  let [signer] = await hre.ethers.getSigners();
  console.log(`Minter: ${signer.address}`);
  console.log(`Receiver: ${taskArgs.receiver}`);
  const nft = (await hre.ethers.getContractFactory("ERC721NFT")).attach(
    taskArgs.nft
  );

  const mint = await nft.mint(taskArgs.receiver, taskArgs.id);
  console.log("Minting...");
  await mint.wait();
  console.log(`Token ID Minted: ${taskArgs.id} on contract: ${taskArgs.nft}`);
  console.log(
    `Check out on https://testnets.opensea.io/assets/mumbai/${taskArgs.nft}/${taskArgs.id}`
  );
  return true;
};
