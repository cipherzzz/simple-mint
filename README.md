# NFT Fractionalizer

This is a simple project illustrating the `fractionalization` of an `ERC721` with `ERC20` tokens. 

---

## Overview
On a high level, the process is as follows

### Collector
- A `collector` owns an `ERC721` from a particular `collection`
- The `collector` deploys the `Fractionalizer` contract which is a modified `ERC20`
- The `collector` approves the `Fractionalize` contract to transfer their `ERC721`
- The `collector` then calls the `fractionalize` method on the deployed `Fractionalizer` contract
- The `collector` receives a specified number of `ERC20` tokens denoting 100% ownership of the `ERC721`
- The `ERC721` is transferred from the `collector` to the `Fractionalizer` contract
- The `collector` can then sell the `ERC20` tokens on the market via AMM or similar
- The `collector` can choose to list the `ERC721` for sale for a specified price in ETH

### Holder
- The `holder` purchases `ERC20` tokens on the market as a representative share of ownership
- If the `ERC721` is sold to the `buyer` the `holder` can redeem their `ERC20` tokens for `eth` based on their ownership ratio from the `Fractionalizer` contract.
  
### Buyer  
- The `buyer` purchases the listed `ERC721` for the price in eth and transfers it to the `Fractionalizer` contract.
- If the `buyer` somehow is able to acquire all the tokens on the market, they can just `redeem` all of them for the nft itself. This is probably a low possibility, though. I just included it as it was in the specs.

---

## Instructions
```
# Install dependencies
npm i

# Setup .env
mv .env.example .env

# Run Tests
npx hardhat test


# Make sure you update the .env with your Goerli pk
# Deploy to Goerli
npx hardhat deploy --network goerli

# Verify contract
npx hardhat verify-contract --network goerli --address <deployed address>
```

## Issues
- The `owner` of the `Fractionalizer` should be a third party - not the `collector`. I just did it this way for the `collector` to deploy their own fractionalization implementation.
- The sale price should be a weighted average of a price indicated by `holders` based on their token holdings. ie. If `holder a` holds half the supply, their price should weigh more than `holder b` with a quarter of the supply. I had the `collector` set the price for simplicity in the example.

## Improvement
- Implement a `factory` that uses the `minimal proxy` pattern to reduce gas costs if we are deploying a single contract per fractionalized nft.
- See weighted average price issue above
- Maybe use an auction style of sale?
- Research adding `withdraw` functions for nft/tokens to prevent unexpected locking within contract
- If `Fractionalizer` is managed by a third party, add a `curator` fee
- Potentially add `permit` eip draft for gassless approvals 