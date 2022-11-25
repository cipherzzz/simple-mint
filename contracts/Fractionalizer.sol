// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

//console.log
// import "hardhat/console.sol";

contract Fractionalizer is ERC20, ERC721Holder, AccessControl, ReentrancyGuard {
    using SafeMath for uint256;

    address public collection;
    uint public tokenId;
    uint public maxSupply;

    bool public fractionalized = false;
    bool public isForSale = false;
    uint public salePriceInEth;
    bool public canWithdrawProceeds = false;

    constructor(string memory _symbol, string memory _description)
        ERC20(_symbol, _description)
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function fractionalize(
        address _collection,
        uint256 _tokenId,
        uint256 _maxSupply
    ) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an admin"
        );

        require(!fractionalized, "NFT already fractionalized");

        collection = _collection;
        tokenId = _tokenId;
        maxSupply = _maxSupply;

        IERC721(_collection).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId
        );

        fractionalized = true;

        _mint(msg.sender, _maxSupply);
    }

    function listForSale(uint256 _amountInEth) external {
        
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an admin"
        );
        require(fractionalized && !isForSale, "Unable to list NFT");
        require(_amountInEth > 0, "Sale price must be greater than 0");
        
        salePriceInEth = _amountInEth;
        isForSale = true;
    }

    function buy() external payable nonReentrant {
        require(fractionalized && isForSale, "Unable to buy NFT");
        require(msg.value == salePriceInEth, "Eth sent does not match sale price");

        IERC721(collection).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );

        isForSale = false;
        canWithdrawProceeds = true;
    }

    function withdrawProceeds(uint256 _amount) external nonReentrant {
        require(canWithdrawProceeds && fractionalized && !isForSale, "Cannot withdraw proceeds");
        require(_amount > 0 && _amount <= totalSupply(), "Amount must be greater than 0 and less than total supply");
        require(_amount <= balanceOf(msg.sender), "Insufficient balance");

        uint contractBalance = address(this).balance;
        uint amountToTransfer = contractBalance.mul(_amount).div(totalSupply());

        _burn(msg.sender, _amount); // need to burn first to [avoid] reentrancy
        payable(msg.sender).transfer(amountToTransfer);
    }
}
