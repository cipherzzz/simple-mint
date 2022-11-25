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

---

## Instructions
```
# Install dependencies
npm i

# Run Tests
npx hardhat test

```
