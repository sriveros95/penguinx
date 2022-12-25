const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { BigNumber } = require('ethers');
const { ethers } = require("hardhat");
// const { Pool } = require ('@uniswap/v3-sdk')
// const { Token } = require ('@uniswap/sdk-core')

const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
const ONE_GWEI = 1_000_000_000;

const SEVEN_DAYS = 604800;
const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const LISTING_PRICE = BigNumber.from("42000000000000000000");

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


    console.log('penguin_x_quarters deployed at', penguin_x_quarters.address);

    // Set verifier
    console.log("Should only allow penguin_master to set verifier");

    await expect(penguin_x_quarters.connect(random_account).setVerifier(penguin_verifier.address, true)).to.be.reverted;
    await expect(penguin_x_quarters.connect(penguin_master).setVerifier(penguin_verifier.address, true)).not.to.be.reverted;

    console.log('penguin_verifier has been set');

    // Deploy modified Thirweb Marketplace
    const PenguinXMarketplace = await ethers.getContractFactory("PenguinXMarketPlace");
    const penguin_x_marketplace = await PenguinXMarketplace.connect(penguin_master).deploy(
      USE_NATIVE_CURRENCY,
      penguin_x_quarters.address,
      penguin_master.address,
      'https://penguinx.xyz/uri/',
      [penguin_master.address],
      penguin_master.address,
      10000
    );

    console.log('penguin_marketplace has been deployed');

    // User create a listing request (create PenguinXNFT)
    const PenguinXNFT = await ethers.getContractFactory("PenguinXNFT");
    const penguin_x_nft = await PenguinXNFT.connect(seller_account).deploy("Rolling Papers", "42 nice rolling papers", penguin_x_quarters.address);

    console.log('penguin_x_nft deployed @', penguin_x_nft.address);


    return { penguin_x_quarters, penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft };
  }

  async function createListing() {

    // ======================================================
    // === SOF same as deployPenguinXQuartersWithVerifier ===

    // Contracts are deployed using the first signer/account by default
    const [penguin_master, penguin_verifier, seller_account, buyer_account, random_account] = await ethers.getSigners();

    const PenguinXQuarters = await ethers.getContractFactory("PenguinXQuarters");
    const penguin_x_quarters = await PenguinXQuarters.deploy();


    console.log('penguin_x_quarters deployed at', penguin_x_quarters.address);

    // Set verifier
    console.log("Should only allow penguin_master to set verifier");

    await expect(penguin_x_quarters.connect(random_account).setVerifier(penguin_verifier.address, true)).to.be.reverted;
    await expect(penguin_x_quarters.connect(penguin_master).setVerifier(penguin_verifier.address, true)).not.to.be.reverted;

    console.log('penguin_verifier has been set');

    // Deploy modified Thirweb Marketplace
    const PenguinXMarketplace = await ethers.getContractFactory("PenguinXMarketPlace");
    const penguin_x_marketplace = await PenguinXMarketplace.connect(penguin_master).deploy(
      USE_NATIVE_CURRENCY,
      penguin_x_quarters.address,
      penguin_master.address,
      'https://penguinx.xyz/uri/',
      [penguin_master.address],
      penguin_master.address,
      10000
    );

    console.log('penguin_marketplace has been deployed');

    // User create a listing request (create PenguinXNFT)
    const PenguinXNFT = await ethers.getContractFactory("PenguinXNFT");
    const penguin_x_nft = await PenguinXNFT.connect(seller_account).deploy("Rolling Papers", "42 nice rolling papers", penguin_x_quarters.address);

    console.log('penguin_x_nft deployed @', penguin_x_nft.address);

    // === EOF deployPenguinXQuartersWithVerifier ===
    // ===============================================

    // Try to list in exchange without verification
    // Should not list if not verified
    const start_time = Math.floor(Date.now() / 1000);

    // TODO test without expect
    await expect(penguin_x_marketplace.connect(seller_account).createListing([
      penguin_x_nft.address,
      0,
      start_time,
      SEVEN_DAYS,
      1,
      USE_NATIVE_CURRENCY,
      LISTING_PRICE,
      LISTING_PRICE,
      0
    ])).to.be.reverted;


    console.log('listing not created as not verified');


    // Set verifier / verified
    // Only authorized verifiers should verify"
    await expect(penguin_x_quarters.connect(seller_account).verify(penguin_x_nft.address)).to.be.reverted;
    await expect(penguin_x_nft.connect(seller_account).verify(seller_account)).to.be.reverted;

    console.log('seller cant verify, only penguin_verifier @', penguin_verifier.address);

    await penguin_x_quarters.connect(penguin_verifier).verify(penguin_x_nft.address);

    await expect(penguin_x_quarters.connect(penguin_verifier).verify(penguin_x_nft.address)).not.to.be.reverted;

    console.log('penguin_x_nft should be verified by', seller_account.address);


    const verifier = await penguin_x_nft.getVerifier()
    console.log('penguin_x_nft verified by', verifier);


    // List in exchange
    console.log("Should list if verified and given approval to marketplace");

    // approve
    penguin_x_nft.connect(seller_account).approve(penguin_x_marketplace.address, 0);

    await penguin_x_marketplace.connect(seller_account).createListing([
      penguin_x_nft.address,
      0,
      start_time,
      SEVEN_DAYS,
      1,
      USE_NATIVE_CURRENCY,
      LISTING_PRICE,
      LISTING_PRICE,
      0]
    )


    return { penguin_x_quarters, penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft };
  }

  describe("Seller create listing", function () {

    it("Should deploy penguin_x_quarters, penguin_x_marketplace and penguin_x_nft belonging to seller_account", async function () {
      const { penguin_x_quarters, penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft } = await deployPenguinXQuartersWithVerifier();

      // Test ownership, only token_id 0 should've been minted
      await expect(penguin_x_nft.ownerOf(1)).to.be.reverted;
      const penguin_x_owner = await penguin_x_nft.ownerOf(0);
      await expect(penguin_x_owner).to.equal(seller_account.address);
      console.log('Owner of 0 is', penguin_x_owner);

    });

    it("Create listing (seller) and verify (penguin_verifier)", async function () {
      const { penguin_x_quarters, penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft } = await createListing();

      try {
        let x = 0;
        while (true) {
          const listings = await penguin_x_marketplace.listings(x);

          if (listings[7] == ZERO_ADDRESS) {
            throw ("ZERO")
          }
          console.log('listing', x, listings);
          x++;
        }
      } catch (error) {

      }

    });

  });

});