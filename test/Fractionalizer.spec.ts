import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NFT, Vault } from "../typechain-types";
import { BigNumber } from "ethers";

describe("Fractionalize NFT", function () {

    // bond erc20 constants
    const ERC20_SYMBOL = "BOND";
    const ERC20_DESCRIPTION = "Bond of fractionalized NFT";

    //BigNumber
    const ERC20_MAX_SUPPLY = ethers.utils.parseEther("1000000");
    const ERC20_HOLDER_AMOUNT = ethers.utils.parseEther("100000");
    const ETH_SALE_PRICE = ethers.utils.parseEther("100");
    const ETH_HOLDER_AMOUNT = 10;


    // nft constants
    const NFT_SYMBOL = "NFT";
    const NFT_DESCRIPTION = "Valuable NFT";
    const NFT_TOKEN1 = 1;

    async function mockTokenPurchase(erc20: Vault, from: any, to: string, tokenAmount: string) {
        await erc20.connect(from).transfer(to, ethers.utils.parseEther(tokenAmount));
    }

    async function fractionalizeListBuy(nft: NFT, collector: any, vault: Vault, NFT_TOKEN1: number, ERC20_MAX_SUPPLY: BigNumber, buyer: any, holder: any) {
        const nftCollector = nft.connect(collector);
        await nftCollector.setApprovalForAll(vault.address, true);
        await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);

        // nft collector lists the nft
        await vault.listForSale(ETH_SALE_PRICE);

        // buyer purchases the nft outright
        const vaultBuyer = vault.connect(buyer);
        await vaultBuyer.buy({ value: ETH_SALE_PRICE });
        expect(await nft.ownerOf(NFT_TOKEN1)).to.equal(buyer.address);
        expect(await ethers.provider.getBalance(vaultBuyer.address)).to.equal(ETH_SALE_PRICE);

        await vault.connect(collector).transfer(holder.address, ERC20_HOLDER_AMOUNT);

        const vaultHolder = vault.connect(holder);
        expect(await vaultHolder.balanceOf(holder.address)).to.equal(ERC20_HOLDER_AMOUNT);
        return vaultHolder;
    }

    async function deployFractionalizeFixture() {

        const [owner, collector, buyer, holder] = await ethers.getSigners();

        // deploy the nft with owner account
        const nft = await (await ethers.getContractFactory("NFT")).connect(owner).deploy(NFT_SYMBOL, NFT_DESCRIPTION);

        // mint nft to collector
        await nft.mint(collector.address, NFT_TOKEN1);
        expect(await nft.ownerOf(NFT_TOKEN1)).to.equal(collector.address);

        // deploy the vault with collector as the owner
        const vault = await (await ethers.getContractFactory("Fractionalizer")).connect(collector).deploy(ERC20_SYMBOL, ERC20_DESCRIPTION);

        return { nft, vault, owner, collector, buyer, holder };
    }

    describe("Deployment", function () {

        it("Should deploy the NFT and Vault contract correctly", async function () {
            const { nft, vault } = await loadFixture(deployFractionalizeFixture);
            expect(nft).to.be.ok;
            expect(vault).to.be.ok;
        });
    });

    describe("Fractionalize", function () {
        it("Should fractionalize the NFT correctly", async function () {
            const { nft, vault, collector } = await loadFixture(deployFractionalizeFixture);

            // nft collector approves the vault to transfer the nft
            const nftCollector = nft.connect(collector);
            await nftCollector.setApprovalForAll(vault.address, true);
            await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);

            // check that the vault has the nft
            expect(await nft.ownerOf(NFT_TOKEN1)).to.equal(vault.address);

            // check that the nft collector has the bond
            expect(await vault.balanceOf(collector.address)).to.equal(ERC20_MAX_SUPPLY);
        });

        // only owner should be able to fractionalize
        it("Should revert if non-owner tries to fractionalize", async function () {
            const { nft, vault, buyer } = await loadFixture(deployFractionalizeFixture);
            const buyerVault = vault.connect(buyer);
            await expect(buyerVault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY)).to.be.revertedWith("Caller is not an admin");
        });


        // should not be able to fractionalize the same nft twice
        it("Should not be able to fractionalize the same NFT twice", async function () {
            const { nft, vault, collector } = await loadFixture(deployFractionalizeFixture);

            // nft collector approves the vault to transfer the nft
            const nftCollector = nft.connect(collector);
            await nftCollector.setApprovalForAll(vault.address, true);
            await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);

            await expect(vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY)).to.be.revertedWith("NFT already fractionalized");
        });

        it("Should not fractionalize the NFT if the NFT is not approved", async function () {
            const { nft, vault } = await loadFixture(deployFractionalizeFixture);
            await expect(vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY)).to.be.revertedWith("ERC721: caller is not token owner or approved");
        });

        it("Should not fractionalize the NFT if the NFT is not owned by the caller", async function () {
            const { nft, vault, owner } = await loadFixture(deployFractionalizeFixture);

            // nft owner approves the vault to transfer the nft
            const nftOwner = nft.connect(owner);
            await nftOwner.setApprovalForAll(vault.address, true);
            await expect(vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY)).to.be.revertedWith("ERC721: caller is not token owner or approved");
        });

        it("Should not fractionalize the NFT if the NFT is already fractionalized", async function () {
            const { nft, vault, collector } = await loadFixture(deployFractionalizeFixture);

            // nft collector approves the vault to transfer the nft
            const nftCollector = nft.connect(collector);
            await nftCollector.setApprovalForAll(vault.address, true);
            await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);
            await expect(vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY)).to.be.revertedWith("NFT already fractionalized");
        });
    });

    describe("List", function () {
        it("Should list the NFT correctly", async function () {
            const { nft, vault, collector } = await loadFixture(deployFractionalizeFixture);

            // nft collector approves the vault to transfer the nft
            const nftCollector = nft.connect(collector);
            await nftCollector.setApprovalForAll(vault.address, true);
            await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);

            // nft collector lists the nft
            await vault.listForSale(ETH_SALE_PRICE);
            expect(await vault.isForSale()).to.equal(true);
            expect(await vault.salePriceInEth()).to.equal(ETH_SALE_PRICE);
        });

        // only owner should be able to list
        it("Should revert if non-owner tries to list", async function () {
            const { vault, buyer } = await loadFixture(deployFractionalizeFixture);
            const buyerVault = vault.connect(buyer);
            await expect(buyerVault.listForSale(ETH_SALE_PRICE)).to.be.revertedWith("Caller is not an admin");
        });

        it("Should not list the NFT if the NFT is not fractionalized", async function () {
            const { vault } = await loadFixture(deployFractionalizeFixture);
            await expect(vault.listForSale(ETH_SALE_PRICE)).to.be.revertedWith("Unable to list NFT");
        });

        it("Should not list the NFT if the NFT is already listed", async function () {
            const { nft, vault, collector } = await loadFixture(deployFractionalizeFixture);

            // nft collector approves the vault to transfer the nft
            const nftCollector = nft.connect(collector);
            await nftCollector.setApprovalForAll(vault.address, true);
            await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);

            // nft collector lists the nft
            await vault.listForSale(ETH_SALE_PRICE);
            await expect(vault.listForSale(ETH_SALE_PRICE)).to.be.revertedWith("Unable to list NFT");
        });
    });

    describe("Buy", function () {
        it("Should buy the NFT correctly", async function () {
            const { nft, vault, collector, buyer } = await loadFixture(deployFractionalizeFixture);

            // nft collector approves the vault to transfer the nft
            const nftCollector = nft.connect(collector);
            await nftCollector.setApprovalForAll(vault.address, true);
            await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);

            // nft collector lists the nft
            await vault.listForSale(ETH_SALE_PRICE);

            const vaultBuyer = vault.connect(buyer);
            await vaultBuyer.buy({ value: ETH_SALE_PRICE });
            expect(await nft.ownerOf(NFT_TOKEN1)).to.equal(buyer.address);
        });

        it("Should not buy the NFT if the NFT is not fractionalized", async function () {
            const { vault, buyer } = await loadFixture(deployFractionalizeFixture);

            const vaultBuyer = vault.connect(buyer);
            await expect(vaultBuyer.buy({ value: ETH_SALE_PRICE })).to.be.revertedWith("Unable to buy NFT");
        });

        it("Should not buy the NFT if the NFT is not listed", async function () {
            const { nft, vault, collector, buyer } = await loadFixture(deployFractionalizeFixture);

            // nft collector approves the vault to transfer the nft
            const nftCollector = nft.connect(collector);
            await nftCollector.setApprovalForAll(vault.address, true);
            await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);

            const vaultBuyer = vault.connect(buyer);
            await expect(vaultBuyer.buy({ value: ETH_SALE_PRICE })).to.be.revertedWith("Unable to buy NFT");
        });

        it("Should not buy the NFT if the NFT is not listed for the correct price", async function () {
            const { nft, vault, collector, buyer } = await loadFixture(deployFractionalizeFixture);

            // nft collector approves the vault to transfer the nft
            const nftCollector = nft.connect(collector);
            await nftCollector.setApprovalForAll(vault.address, true);
            await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);

            // nft collector lists the nft
            await vault.listForSale(ETH_SALE_PRICE);

            const vaultBuyer = vault.connect(buyer);
            await expect(vaultBuyer.buy({ value: ethers.utils.parseEther("99") })).to.be.revertedWith("Eth sent does not match sale price");
        });
    });

    describe("Withdraw Proceeds", function () {
        it("Should withdraw the proceeds correctly", async function () {
            const { nft, vault, collector, buyer, holder } = await loadFixture(deployFractionalizeFixture);

            // convenience method for happy path of fractionalize, list, buy
            const vaultHolder = await fractionalizeListBuy(nft, collector, vault, NFT_TOKEN1, ERC20_MAX_SUPPLY, buyer, holder);

            //get eth balance before withdraw
            const ethBalanceBefore = await ethers.provider.getBalance(holder.address);
            await vaultHolder.withdrawProceeds(ERC20_HOLDER_AMOUNT);
            const ethBalanceAfter = await ethers.provider.getBalance(holder.address);
            expect(Number(ethers.utils.formatEther(ethBalanceAfter.sub(ethBalanceBefore)))).to.be.closeTo(ETH_HOLDER_AMOUNT, 0.0001);
            expect(await vault.balanceOf(holder.address)).to.equal(0);
        });

        it("Should not withdraw the proceeds if the NFT is not fractionalized", async function () {
            const { vault, holder } = await loadFixture(deployFractionalizeFixture);

            const vaultHolder = vault.connect(holder);
            await expect(vaultHolder.withdrawProceeds(ERC20_HOLDER_AMOUNT)).to.be.revertedWith("Cannot withdraw proceeds");
        });

        it("Should not withdraw the proceeds if the NFT is not listed", async function () {
            const { nft, vault, collector, holder } = await loadFixture(deployFractionalizeFixture);

            // nft collector approves the vault to transfer the nft
            const nftCollector = nft.connect(collector);
            await nftCollector.setApprovalForAll(vault.address, true);
            await vault.fractionalize(nft.address, NFT_TOKEN1, ERC20_MAX_SUPPLY);

            await vault.connect(collector).transfer(holder.address, ERC20_HOLDER_AMOUNT);

            const vaultHolder = vault.connect(holder);
            await expect(vaultHolder.withdrawProceeds(ERC20_HOLDER_AMOUNT)).to.be.revertedWith("Cannot withdraw proceeds");
        });

        // should not withdraw if amount is greater than balance
        it("Should not withdraw the proceeds if the amount is greater than the balance", async function () {
            const { nft, vault, collector, buyer, holder } = await loadFixture(deployFractionalizeFixture);

            // convenience method for happy path of fractionalize, list, buy
            const vaultHolder = await fractionalizeListBuy(nft, collector, vault, NFT_TOKEN1, ERC20_MAX_SUPPLY, buyer, holder);
            await expect(vaultHolder.withdrawProceeds(ethers.utils.parseEther("1000000000"))).to.be.revertedWith("Amount must be greater than 0 and less than total supply");
        });

        // should not withdraw if amount is 0
        it("Should not withdraw the proceeds if the amount is 0", async function () {
            const { nft, vault, collector, buyer, holder } = await loadFixture(deployFractionalizeFixture);

            // convenience method for happy path of fractionalize, list, buy
            const vaultHolder = await fractionalizeListBuy(nft, collector, vault, NFT_TOKEN1, ERC20_MAX_SUPPLY, buyer, holder);
            await expect(vaultHolder.withdrawProceeds(ethers.utils.parseEther("0"))).to.be.revertedWith("Amount must be greater than 0 and less than total supply");
        });

        it("Should not withdraw the proceeds if the amount is greater than the balance of the holder", async function () {
            const { nft, vault, collector, buyer, holder } = await loadFixture(deployFractionalizeFixture);

            // convenience method for happy path of fractionalize, list, buy
            const vaultHolder = await fractionalizeListBuy(nft, collector, vault, NFT_TOKEN1, ERC20_MAX_SUPPLY, buyer, holder);
            await expect(vaultHolder.withdrawProceeds(ethers.utils.parseEther("200000"))).to.be.revertedWith("Insufficient balance");
        });
    });
});


