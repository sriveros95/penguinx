const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require ("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require ("chai");
const { BigNumber } = require('ethers');
const { ethers } = require("hardhat");
// const { Pool } = require ('@uniswap/v3-sdk')
// const { Token } = require ('@uniswap/sdk-core')

const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
const ONE_GWEI = 1_000_000_000;
const min_mint_eth = ONE_GWEI * 2;

console.log('penguin test');

describe("PenguinX", function () {

  console.log('penguin test');
  

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployPenguinXQuartersWithVerifier() {
    // Contracts are deployed using the first signer/account by default
    const [penguin_master, penguin_verifier, seller_account, buyer_account, random_account] = await ethers.getSigners();

    const PenguinXQuarters = await ethers.getContractFactory("PenguinXQuarters");
    const penguin_x_quarters = await PenguinXQuarters.deploy();

    // Set verifier
    it("Should only allow penguin_master to set verifier", async function () {
      await expect(penguin_x_quarters.connect(random_account).setVerifier(penguin_verifier.address, true)).to.be.reverted;
      await expect(penguin_x_quarters.connect(penguin_master).setVerifier(penguin_verifier.address, true)).not.to.be.reverted;
    });

    console.log('penguin_verifier has been set');

    // // User create a listing request (create PenguinXNFT)
    // const PenguinXNFT = await ethers.getContractFactory("PenguinXNFT");
    // const penguin_x_nft = await PenguinXNFT.connect(sellerAccount).deploy(1000);

    // Test ownership
    // expect(await penguin_x_nft.owner()).to.not.equal(owner);
    // expect(await myContract.owner()).to.equal(acc1.address);

    // await expect(ncb.connect(otherAccount).setSeason(42)).to.be.revertedWith(
    //   "Ownable: caller is not the owner"
    // );


    // // Set self as verifier
    // await penguin_x_quarters.connect(owner).setVerifier(owner.address, true);


    return { penguin_x_quarters, min_mint_eth, penguin_master, penguin_verifier, seller_account, buyer_account, random_account };
  }

  describe("Seller create listing", function () {

    it("Should deploy", async function () {
      const { penguin_x_quarters, min_mint_eth, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinXQuartersWithVerifier();

      console.log('deplo',);

      // expect(await weth9.connect(otherAccount).balanceOf(otherAccount.address)).to.equal(min_mint_eth);
    });

  });