// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    constructor(string memory _symbol, string memory _description) ERC721(_symbol, _description) {
    }

    function mint(address _to, uint256 _tokenId) external {
        _mint(_to, _tokenId);
    }
}