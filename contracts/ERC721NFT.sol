// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ERC721NFT is ERC721URIStorage {
    address public owner;

    constructor(
        string memory _symbol,
        string memory _description
    ) ERC721(_symbol, _description) ERC721URIStorage() {
        owner = msg.sender;
    }

    function mint(address _to, uint256 _tokenId) external {
        _mint(_to, _tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return
            "ipfs://bafybeias3vyhhhyrhghcc2f6povcfzfkgqry4ajsx5hizklcn2dpnzief4/";
    }
}
