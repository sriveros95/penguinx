const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { BigNumber } = require('ethers');
const { ethers } = require("hardhat");
var _ = require('lodash');

// const { Pool } = require ('@uniswap/v3-sdk')
// const { Token } = require ('@uniswap/sdk-core')

const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
const ONE_GWEI = 1_000_000_000;

const SEVEN_DAYS = 604800;
// const NATIVE_CURRENCY_WRAPPER = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
// const NATIVE_CURRENCY_WRAPPER = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";  // Goerli WETH
const NATIVE_CURRENCY_WRAPPER = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";     // Polygon WETH

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";    // Polygon
// const USDC_ADDRESS = "0xEEa85fdf0b05D1E0107A61b4b4DB1f345854B952"  // Goerli
const LISTING_PRICE = BigNumber.from("42000000000000000000");
const start_time = Math.floor(Date.now() / 1000);

console.log('penguin test');

const getMethods = (obj) => {
  let properties = new Set()
  let currentObj = obj
  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
  } while ((currentObj = Object.getPrototypeOf(currentObj)))
  return [...properties.keys()].filter(item => typeof obj[item] === 'function')
}

describe("PenguinX", function () {

  console.log('penguin test');

  async function deployPenguinX() {
    const [penguin_master, penguin_verifier, seller_account, buyer_account, random_account] = await ethers.getSigners();
    console.log('penguin_master @', penguin_master.address, 'will deploy quarters');

    // Deploy PenguinX Head Quarters
    const PenguinXQuarters = await ethers.getContractFactory("PenguinXQuarters");
    const penguin_x_quarters = await PenguinXQuarters.deploy();
    console.log('penguin_x_quarters deployed at', penguin_x_quarters.address);

    // Set verifier
    // console.log("Should only allow penguin_master to set verifier, random account will attempt", random_account.address);
    // await expect(penguin_x_quarters.connect(random_account).setVerifier(penguin_verifier.address, true)).to.be.reverted;
    await expect(penguin_x_quarters.connect(penguin_master).setVerifier(penguin_verifier.address, true)).not.to.be.reverted;
    console.log('penguin_verifier has been set, master @', penguin_master.address, 'will deploy marketplace');

    // Deploy modified Thirweb Marketplace
    const PenguinXMarketplace = await ethers.getContractFactory("PenguinXMarketPlace");
    const penguin_x_marketplace = await PenguinXMarketplace.connect(penguin_master).deploy(
      NATIVE_CURRENCY_WRAPPER,
      penguin_x_quarters.address,
      penguin_master.address,
      'https://penguinx.xyz/uri/',
      [penguin_master.address],
      penguin_master.address,
      10000
    );
    console.log('penguin_marketplace has been deployed @', penguin_x_marketplace.address, 'DEFAULT_ADMIN_ROLE:', await penguin_x_marketplace.DEFAULT_ADMIN_ROLE());

    // Deploy Penguin X Factory
    const PenguinXFactory = await ethers.getContractFactory("PenguinXFactory");
    const penguin_x_factory = await PenguinXFactory.connect(penguin_master).deploy(
      penguin_x_quarters.address,
      penguin_x_marketplace.address
    );
    console.log('penguin_x_factory has been deployed @', penguin_x_factory.address);
    await penguin_x_factory.deployed();

    // Set factory address in marketplace
    await penguin_x_marketplace.connect(penguin_master).setFactory(penguin_x_factory.address);
    console.log('penguin_x_factory address set in marketplace', await penguin_x_marketplace.PENGUIN_X_FACTORY_ADDRESS());

    return { penguin_x_quarters, penguin_x_marketplace, penguin_x_factory, penguin_master, penguin_verifier, seller_account, buyer_account, random_account };
  }

  async function createListing(penguin_x_quarters, penguin_x_marketplace, penguin_verifier, seller_account) {
    console.log('penguin x deployed');

    // Seller account create sell request
    const tx = await penguin_x_marketplace.connect(seller_account).createListingRequest("Rolling Papers", "42 nice rolling papers", "ipfs://coolmetadata", LISTING_PRICE);
    console.log('penguin_x_nft deployed using factory tx:', tx);
    const txReceipt = await tx.wait();
    console.log('events', txReceipt.events);
    const transferEvent = _.find(txReceipt.events, { 'event': 'NewListingRequest' });
    console.log('transferEvent', transferEvent);
    const [penguin_x_nft_address] = transferEvent.args;
    console.log('penguin_x_nft_address', penguin_x_nft_address);
    const penguin_x_nft = await ethers.getContractAt("PenguinXNFT", penguin_x_nft_address);
    console.log('penguin_x_nft loaded @', penguin_x_nft.address, 'tokenURI:', await penguin_x_nft.tokenURI(0));

    // Try to list in exchange without verification
    // Should not list if not verified

    // await expect(penguin_x_marketplace.connect(seller_account).createListing([
    //   penguin_x_nft.address,
    //   0,
    //   start_time,
    //   SEVEN_DAYS,
    //   1,
    //   NATIVE_CURRENCY_WRAPPER,
    //   LISTING_PRICE,
    //   LISTING_PRICE,
    //   0
    // ])).to.be.reverted;

    // await penguin_x_marketplace.connect(seller_account).createListing([
    //   penguin_x_nft.address,
    // ])

    // Set verifier / verified
    // Only authorized verifiers should verify"
    await expect(penguin_x_quarters.connect(seller_account).verify(penguin_x_nft.address, [])).to.be.revertedWith("NOT_VERIFIER");
    await expect(penguin_x_nft.connect(seller_account).verify(seller_account.address, [])).to.be.revertedWith("NOT_QUARTERS");

    console.log('seller cant verify, only penguin_verifier @', penguin_verifier.address);

    // await penguin_x_quarters.connect(penguin_verifier).verify(penguin_x_nft.address);

    await expect(penguin_x_quarters.connect(penguin_verifier).verify(penguin_x_nft.address, [4, 20])).not.to.be.reverted;

    console.log('penguin_x_nft should be verified by', seller_account.address);


    const verifier = await penguin_x_nft.getVerifier()
    console.log('penguin_x_nft verified by', verifier, 'status is', await penguin_x_nft.status());


    // List in exchange
    console.log("Should list if verified and given approval to marketplace...");

    // await penguin_x_marketplace.connect(seller_account).createListing([
    //   penguin_x_nft.address,
    //   0,
    //   start_time,
    //   SEVEN_DAYS,
    //   1,
    //   NATIVE_CURRENCY_WRAPPER,
    //   LISTING_PRICE,
    //   LISTING_PRICE,
    //   0]
    // )

    await penguin_x_marketplace.connect(penguin_verifier).createListing(
      penguin_x_nft.address
    );

    console.log('listing created, penguin x nft status', await penguin_x_nft.status());

    return penguin_x_nft;
  }

  async function buyListing(penguin_x_quarters, penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft) {
    console.log('penguin x listing created');

    // Get listing
    const listing_0 = await penguin_x_marketplace.connect(buyer_account).getListing(0);

    console.log('listing_0', listing_0);

    const penguin_x_nft_from_listing = await ethers.getContractAt("PenguinXNFT", listing_0.assetContract);

    console.log('listing_0 price delivery to zone 0', await penguin_x_nft_from_listing.getPrice(0));

    const erc20_usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    console.log('usdc', erc20_usdc);
    console.log('totalSupply', await erc20_usdc.totalSupply());

    console.log('erc20_usdc balance of buyer', buyer_account.address, await erc20_usdc.balanceOf(buyer_account.address));
    console.log('erc20_usdc balance of marketplace', penguin_x_marketplace.address, await erc20_usdc.balanceOf(penguin_x_marketplace.address));
    console.log('erc20_usdc balance of seller', seller_account.address, await erc20_usdc.balanceOf(seller_account.address));


    // Buy Item
    // Approve marketplace to use usdc
    await erc20_usdc.connect(buyer_account).approve(penguin_x_marketplace.address, listing_0.reservePricePerToken);
    console.log('buyer approved to spend usdc', listing_0.reservePricePerToken);

    const utf8Encode = new TextEncoder();
    const deliveryData = utf8Encode.encode("abc street");

    await penguin_x_marketplace.connect(buyer_account).buy(
      listing_0.listingId,
      buyer_account.address,
      1,
      USDC_ADDRESS,
      listing_0.reservePricePerToken,
      0,
      deliveryData
    )

    const provider = ethers.provider;
    const balance = await provider.getBalance(buyer_account.address);

    console.log('buyer_account native balance', buyer_account.address, balance);

    console.log('erc20_usdc balance of buyer', buyer_account.address, await erc20_usdc.balanceOf(buyer_account.address));
    console.log('erc20_usdc balance of marketplace', penguin_x_marketplace.address, await erc20_usdc.balanceOf(penguin_x_marketplace.address));

    console.log('listing bought');

    // await expect(await penguin_x_nft.status()).to.equal(1);

    // Seller gets delivery data
    console.log('penguinx nft status is', await penguin_x_nft.status());
    console.log('penguinx nft stored deliveryData', await penguin_x_nft.connect(seller_account).getDeliveryData());


    // Seller sends package and registers tracking code
    let trackingCode = "420-69-777";
    trackingCode = ethers.utils.formatBytes32String(trackingCode);
    await penguin_x_marketplace.connect(seller_account).addTrackingCode(listing_0.listingId, trackingCode);
    console.log('tracking code added', trackingCode);

    // Verifier verifies tracking code
    const retrieved_tracking_code = await penguin_x_quarters.connect(penguin_verifier).getTrackingCode(penguin_x_nft.address)
    console.log('penguinx nft stored tracking code', retrieved_tracking_code);
    console.log(ethers.utils.parseBytes32String(retrieved_tracking_code));
    // Status code 3 is delivery verified
    await penguin_x_quarters.connect(penguin_verifier).verifyDeliveryStatus(penguin_x_nft.address, 3);
    const verified_delivery_status = await penguin_x_nft.status();
    console.log('penguinx nft delivery status has been verified', retrieved_tracking_code, 'nft status is', verified_delivery_status);
    await expect(verified_delivery_status).to.equal(3);

    const penguin_x_owner = await penguin_x_nft.ownerOf(0);
    console.log('owner of penguin nft', penguin_x_owner);
    await expect(penguin_x_owner).to.equal(buyer_account.address);

    console.log('erc20_usdc balance of buyer', buyer_account.address, await erc20_usdc.balanceOf(buyer_account.address));
    console.log('erc20_usdc balance of marketplace', penguin_x_marketplace.address, await erc20_usdc.balanceOf(penguin_x_marketplace.address));
    console.log('erc20_usdc balance of seller', seller_account.address, await erc20_usdc.balanceOf(seller_account.address));

    return { penguin_x_quarters, penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft };
  }

  async function removeListing(penguin_x_marketplace, account, listing_id = 0) {
    console.log('removeListing', listing_id);

    await penguin_x_marketplace.connect(account).delist(listing_id);

    console.log('listing delisted');
  }


  describe("Penguin X List, Delist, Buy & Deliver", function () {

    it.only("should deploy", async () => {
      const { penguin_x_quarters, penguin_x_marketplace, penguin_x_factory, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinX();
      console.log('base deployed');
    })

    it.only("should create listing (seller) and verify (penguin_verifier)", async () => {
      const { penguin_x_quarters, penguin_x_marketplace, penguin_x_factory, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinX();
      console.log('base deployed');
      
      // Listing 0 created
      const penguin_x_nft = await createListing(penguin_x_quarters, penguin_x_marketplace, penguin_verifier, seller_account);
      console.log('Listing 0 created, penguin_x_nft @', penguin_x_nft.address);
    })

    it.only("should buy listing", async () => {
      const { penguin_x_quarters, penguin_x_marketplace, penguin_x_factory, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinX();
      console.log('base deployed');
      
      // Listing 0 created
      const penguin_x_nft = await createListing(penguin_x_quarters, penguin_x_marketplace, penguin_verifier, seller_account);
      console.log('Listing 0 created, penguin_x_nft @', penguin_x_nft.address);

      console.log('created listing ', penguin_x_nft.address);
      await buyListing(penguin_x_quarters, penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft);
      console.log('bought nft ', penguin_x_nft.address);
    })

    it.only("should list and delist", async () => {
      const { penguin_x_quarters, penguin_x_marketplace, penguin_x_factory, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinX();
      console.log('base deployed');
      
      // Listing 0 created
      const penguin_x_nft = await createListing(penguin_x_quarters, penguin_x_marketplace, penguin_verifier, seller_account);
      console.log('Listing 0 created, penguin_x_nft @', penguin_x_nft.address);

      console.log('created listing ', penguin_x_nft.address);
      await removeListing(penguin_x_marketplace, seller_account, 0);
      console.log('removed listing', penguin_x_nft.address, 'status is', await penguin_x_nft.status());

      const listing = await penguin_x_marketplace.getListing(0);
      console.log('listing 0 quantity', listing['quantity']);
    })
  });
});