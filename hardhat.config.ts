import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import { deployNFTContract, mintToken } from "./src/util/task-helpers";

dotenv.config();

// Deploy an individual NFT
task("deploy", "Deploy an nft contract")
  .addParam("description", "The description of the token", "Dude, sick token!")
  .addParam("symbol", "The symbol of the token", "DUDESICKTOKEN")
  .setAction(async (taskArgs, hre) => {
    await deployNFTContract(taskArgs, hre);
  });

// Mint token
task("mint", "mint nft from contract")
  .addParam("nft", "The contract address")
  .addParam("receiver", "The reciever address")
  .addParam("id", "The tokenId")
  .setAction(async (taskArgs, hre) => {
    await mintToken(taskArgs, hre);
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: process.env.PK !== undefined ? [process.env.PK] : [],
      gas: 2100000,
      gasPrice: 8000000000,
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: process.env.PK !== undefined ? [process.env.PK] : [],
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY
        ? process.env.ETHERSCAN_API_KEY
        : "",
    },
  },
};

export default config;
