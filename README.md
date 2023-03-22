# Simple Mint

This is a simple project to deploy a contract and mint tokens on it.

## Instructions

```bash

# Install dependencies
npm i

# Setup .env
mv .env.example .env

# Add mumbai rpc url - you can get a free rpc url from alchemy 
# - something like https://polygon-mumbai.g.alchemy.com/v2/<alchemyid>
#
# Add private key from test account - don't use an account with real money on it please
# - You can get this from metamask - Account Details => Show Private Key

# Compile Smart Contract
npx hardhat compile

# Deploy NFT contract to Mumbai
npx hardhat deploy --symbol MARK --description "Mark has a token" --network mumbai

# Mint Token on deployed contract
# Note that I only have metadata for ids 1-6
# Deploy another contract if you use all these up
npx hardhat mint --nft <deployed contract address> --id <1 through 6> --receiver <address to send token to> --network mumbai

```

## Viewing on OpenSea

You should be able to see your minted contract and token by using the following template
`https://testnets.opensea.io/assets/mumbai/<contract address>/<token id>`