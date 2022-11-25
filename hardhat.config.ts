import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


// Deploy the contract
task(
  "deploy",
  "Deploys the Fractionalizer contract"
).setAction(async (taskArgs, hre) => {
  const fractionalizer = await (await hre.ethers.getContractFactory("Fractionalizer")).deploy("FRACTIONALIZE", "Fractionalize an ERC721");
  console.log(`Fractionalizer: deployed to: ${fractionalizer.address}`);
});

// Verify a contract
task("verify-contract", "Verify Fractionalizer contract")
  .addParam("address", "The contract address")
  .setAction(async (taskArgs, hre) => {
    try {
      console.log("Verifying contract...");
      await hre.run("verify:verify", {
        address: taskArgs.address,
        constructorArguments: ["FRACTIONALIZE", "Fractionalize an ERC721"],
        contract: "contracts/Fractionalizer.sol:Fractionalizer",
      });
    } catch (err: any) {
      if (err.message.includes("Reason: Already Verified")) {
        console.log("Contract is already verified!");
      } else {
        console.log(err.message);
      }
    }
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
    goerli: {
      url: process.env.RPC_URL,
      accounts:
        process.env.PK !== undefined
          ? [process.env.PK]
          : [],
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    token: "ETH",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: {
        goerli: process.env.ETHERSCAN_API_KEY?process.env.ETHERSCAN_API_KEY:"",
    }
}
};

export default config;
