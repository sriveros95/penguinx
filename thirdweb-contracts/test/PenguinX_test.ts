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
const ONE_WEEK = 7 * 24 * 60 * 60;

const SEVEN_DAYS = 604800;
// const NATIVE_CURRENCY_WRAPPER = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
// const NATIVE_CURRENCY_WRAPPER = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";  // Goerli WETH
const NATIVE_CURRENCY_WRAPPER = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";     // Polygon WETH

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";    // Polygon
// const USDC_ADDRESS = "0xEEa85fdf0b05D1E0107A61b4b4DB1f345854B952"  // Goerli
const LISTING_PRICE = BigNumber.from("420777");
const DELIVERY_PRICES = [0, 420000, 940000];
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

  console.log('Penguin X Test');

  async function deployPenguinX() {
    const [penguin_master, penguin_verifier, seller_account, buyer_account, random_account] = await ethers.getSigners();
    console.log('penguin_master @', penguin_master.address, 'will deploy marketplace');
    console.log('penguin_verifier @', penguin_verifier.address);
    console.log('seller_account @', seller_account.address);
    console.log('buyer_account @', buyer_account.address);

    // Deploy modified Thirweb Marketplace
    const PenguinXMarketplace = await ethers.getContractFactory("PenguinXMarketPlace");
    const penguin_x_marketplace = await PenguinXMarketplace.connect(penguin_master).deploy(
      NATIVE_CURRENCY_WRAPPER,
      penguin_master.address,
      'https://penguinx.xyz/uri/',
      [penguin_master.address],
      penguin_master.address,
      10000
    );
    console.log('penguin_marketplace has been deployed @', penguin_x_marketplace.address, 'DEFAULT_ADMIN_ROLE:', await penguin_x_marketplace.DEFAULT_ADMIN_ROLE());

    // Set verifier
    // console.log("Should only allow penguin_master to set verifier, random account will attempt", random_account.address);
    // await expect(penguin_x_quarters.connect(random_account).setVerifier(penguin_verifier.address, true)).to.be.reverted;
    await expect(penguin_x_marketplace.connect(penguin_master).setVerifier(penguin_verifier.address, true)).not.to.be.reverted;
    console.log('penguin_verifier has been set, master @', penguin_master.address, 'will deploy marketplace');

    // Deploy Penguin X Factory
    const PenguinXNFT = await ethers.getContractFactory("PenguinXNFT");
    const penguin_x_nft = await PenguinXNFT.connect(penguin_master).deploy(
      "Penguin X NFT",
      penguin_x_marketplace.address
    );
    console.log('penguin_x_nft has been deployed @', penguin_x_nft.address);
    await penguin_x_nft.deployed();

    // Set penguin_x_nft address in marketplace
    await penguin_x_marketplace.connect(penguin_master).setPenguinXNFT(penguin_x_nft.address);
    console.log('penguin_x_nft address set in marketplace', await penguin_x_marketplace.PENGUIN_X_NFT());

    return { penguin_x_marketplace, penguin_x_nft, penguin_master, penguin_verifier, seller_account, buyer_account, random_account };
  }

  async function createListing(penguin_x_nft, penguin_x_marketplace, penguin_verifier, seller_account) {
    console.log('penguin x deployed, will create listing request');

    // Seller account create sell request
    const tx = await penguin_x_marketplace.connect(seller_account).createListingRequest("Rolling Papers", "42 nice rolling papers", "ipfs://coolmetadata", LISTING_PRICE);
    console.log('listing request tx:', tx);
    const txReceipt = await tx.wait();
    console.log('events', txReceipt.events);
    const transferEvent = _.find(txReceipt.events, { 'event': 'NewListingRequest' });
    console.log('transferEvent', transferEvent);
    const [listing_request_id] = transferEvent.args;
    console.log('listing request id', listing_request_id);


    // Set verifier / verified
    // Only authorized verifiers should verify"
    await expect(penguin_x_marketplace.connect(seller_account).createListing(listing_request_id, DELIVERY_PRICES, ONE_WEEK)).to.be.revertedWith("NOT_VERIFIER");

    console.log('seller cant verify, only penguin_verifier @', penguin_verifier.address);

    const tx2 = await penguin_x_marketplace.connect(penguin_verifier).createListing(listing_request_id, DELIVERY_PRICES, ONE_WEEK);
    console.log('create listing (verify) tx:', tx);
    const tx2Receipt = await tx2.wait();
    console.log('events', tx2Receipt.events);
    const transfer2Event = _.find(tx2Receipt.events, { 'event': 'ListingAdded' });
    console.log('transferEvent', transfer2Event);
    const [listing_id] = transfer2Event.args;
    console.log('listing id', listing_id);

    console.log('listing created');

    const verifier = await penguin_x_nft.getVerifier(listing_id)
    console.log('penguin_x_nft verified by', verifier, 'status is', await penguin_x_nft.getStatus(listing_id));


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
    console.log('listing created, penguin x nft status', await penguin_x_nft.getStatus(listing_id));
    const listing = await penguin_x_marketplace.getListing(listing_id);

    return (listing);
  }

  async function buyListing(penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft) {
    console.log('penguin x listing created');

    // Get listing
    const listing_0 = await penguin_x_marketplace.connect(buyer_account).getListing(0);

    console.log('buy listing 0', listing_0, 'id: ', listing_0.listingId);

    const penguin_x_nft_from_listing = await ethers.getContractAt("PenguinXNFT", listing_0.assetContract);

    const delivery_price = await penguin_x_nft_from_listing.getDeliveryPrice(listing_0.listingId, 1);
    console.log('listing_0 price delivery to zone 1', delivery_price);
    console.log('listing_0.reservePricePerToken', listing_0.reservePricePerToken);


    const erc20_usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    console.log('usdc @', USDC_ADDRESS, erc20_usdc);
    console.log('usdc totalSupply', await erc20_usdc.totalSupply());

    console.log('erc20_usdc balance of buyer', buyer_account.address, await erc20_usdc.balanceOf(buyer_account.address));
    console.log('erc20_usdc balance of marketplace', penguin_x_marketplace.address, await erc20_usdc.balanceOf(penguin_x_marketplace.address));
    console.log('erc20_usdc balance of seller', seller_account.address, await erc20_usdc.balanceOf(seller_account.address));


    // Buy Item
    // Approve marketplace to use usdc
    const total_price = BigNumber.from((listing_0.reservePricePerToken).toString()).add(BigNumber.from((delivery_price).toString()));
    console.log(BigNumber.from((listing_0.reservePricePerToken).toString()), BigNumber.from((delivery_price).toString()), '=', total_price);

    await erc20_usdc.connect(buyer_account).approve(penguin_x_marketplace.address, total_price);
    console.log('buyer approved to spend usdc', total_price);

    const utf8Encode = new TextEncoder();
    const deliveryData = utf8Encode.encode("abc street");
    console.log('buy with deliveryData', deliveryData);


    const buy_resp = await penguin_x_marketplace.connect(buyer_account).buy(
      listing_0.listingId,
      buyer_account.address,
      1,  // Quantity
      USDC_ADDRESS,
      total_price,
      1,  // Colombia
      deliveryData
    )

    console.log('buy_resp', await buy_resp.wait());


    const provider = ethers.provider;
    const balance = await provider.getBalance(buyer_account.address);

    console.log('buyer_account native balance', buyer_account.address, balance);

    console.log('erc20_usdc balance of buyer', buyer_account.address, await erc20_usdc.balanceOf(buyer_account.address));
    console.log('erc20_usdc balance of marketplace', penguin_x_marketplace.address, await erc20_usdc.balanceOf(penguin_x_marketplace.address));

    console.log('listing bought');

    // Seller gets delivery data
    console.log('penguinx nft status is', await penguin_x_nft.getStatus(listing_0.listingId));
    console.log('penguinx nft get delivery info', await penguin_x_marketplace.connect(seller_account).getDeliveryInfo(listing_0.listingId));


    // Seller sends package and registers tracking code
    let trackingCode = "420-69-777";
    trackingCode = ethers.utils.formatBytes32String(trackingCode);
    await penguin_x_marketplace.connect(seller_account).addTrackingCode(listing_0.listingId, trackingCode, "proof_uri");
    console.log('tracking code added', trackingCode);

    // Verifier verifies tracking code
    const retrieved_tracking_code = await penguin_x_marketplace.connect(penguin_verifier).getDeliveryInfo(listing_0.listingId);
    console.log('getDeliveryInfo', retrieved_tracking_code);
    console.log(retrieved_tracking_code['_tracking_code']);

    console.log(ethers.utils.parseBytes32String(retrieved_tracking_code['_tracking_code']));


    return { penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft };
  }

  async function removeListing(penguin_x_marketplace, account, listing_id = 0) {
    console.log('removeListing', listing_id);

    await penguin_x_marketplace.connect(account).delist(listing_id);

    console.log('listing delisted');
  }


  describe("Penguin X List, Delist, Buy & Deliver", function () {

    it.only("should deploy", async () => {
      const { penguin_x_marketplace, penguin_x_nft, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinX();
      console.log('base deployed');
    })

    it.only("should create listing (seller) and verify (penguin_verifier)", async () => {
      const { penguin_x_marketplace, penguin_x_nft, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinX();
      console.log('base deployed');

      // Listing 0 created
      await createListing(penguin_x_nft, penguin_x_marketplace, penguin_verifier, seller_account);
      console.log('Listing 0 created, penguin_x_nft @', penguin_x_nft.address);
    })

    it.only("should buy listing", async () => {
      const { penguin_x_marketplace, penguin_x_nft, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinX();
      console.log('base deployed');

      // Listing 0 created
      const listing = await createListing(penguin_x_nft, penguin_x_marketplace, penguin_verifier, seller_account);

      console.log('created listing for buying', penguin_x_nft.address);
      await buyListing(penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft);
      console.log('bought nft ', penguin_x_nft.address);

      // Mark Delivery In Progress Verified  (status 31)
      console.log('verifying delivery status (status 31)');
      const vds_tx = await penguin_x_marketplace.connect(penguin_verifier).verifyDeliveryStatus(listing.listingId, 31);
      const vds_txReceipt = await vds_tx.wait();
      console.log('vds_txReceipt', vds_txReceipt);

      const verified_delivery_status = await penguin_x_nft.getStatus(listing.listingId);
      console.log('penguinx nft delivery status has been verified nft status is', verified_delivery_status);
      await expect(verified_delivery_status).to.equal(31);

      // Verifier verifies tracking code
      const retrieved_tracking_code_by_buyer = await penguin_x_nft.connect(buyer_account).getDeliveryInfo(listing.listingId);
      console.log('buyer retrieved tracking code', retrieved_tracking_code_by_buyer['_tracking_code']);
      console.log(ethers.utils.parseBytes32String(retrieved_tracking_code_by_buyer['_tracking_code']));

      const penguin_x_owner = await penguin_x_nft.ownerOf(listing.listingId);
      console.log('owner of penguin nft', penguin_x_owner);
      await expect(penguin_x_owner).to.equal(buyer_account.address);

      const erc20_usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
      console.log('usdc @', USDC_ADDRESS, erc20_usdc);
      console.log('usdc totalSupply', await erc20_usdc.totalSupply());

      console.log('erc20_usdc balance of buyer', buyer_account.address, await erc20_usdc.balanceOf(buyer_account.address));
      console.log('erc20_usdc balance of marketplace', penguin_x_marketplace.address, await erc20_usdc.balanceOf(penguin_x_marketplace.address));
      console.log('erc20_usdc balance of seller', seller_account.address, await erc20_usdc.balanceOf(seller_account.address));
    })

    it.only("should list and delist", async () => {
      const { penguin_x_marketplace, penguin_x_nft, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinX();
      console.log('base deployed');

      // Listing 0 created
      await createListing(penguin_x_nft, penguin_x_marketplace, penguin_verifier, seller_account);
      console.log('Listing 0 created, penguin_x_nft @', penguin_x_nft.address);

      console.log('created listing ', penguin_x_nft.address);
      await removeListing(penguin_x_marketplace, seller_account, 0);
      console.log('removed listing', penguin_x_nft.address, 'status is', await penguin_x_nft.getStatus(0));

      const listing = await penguin_x_marketplace.getListing(0);
      console.log('listing 0 quantity', listing['quantity']);
    })

    it.only("should buy listing and return money if delivery not verified", async () => {
      const { penguin_x_marketplace, penguin_x_nft, penguin_master, penguin_verifier, seller_account, buyer_account, random_account } = await deployPenguinX();
      console.log('base deployed');

      // Listing 0 created
      const listing = await createListing(penguin_x_nft, penguin_x_marketplace, penguin_verifier, seller_account);

      console.log('created listing for buying', penguin_x_nft.address);
      await buyListing(penguin_x_marketplace, penguin_master, penguin_verifier, seller_account, buyer_account, random_account, penguin_x_nft);
      console.log('bought nft ', penguin_x_nft.address);

      // Mark Delivery In Progress Failed  (status 29)
      console.log('verifying delivery status failed (status 29)');
      const vds_tx = await penguin_x_marketplace.connect(penguin_verifier).verifyDeliveryStatus(listing.listingId, 29);
      const vds_txReceipt = await vds_tx.wait();
      console.log('vds_txReceipt', vds_txReceipt);

      console.log('status', await penguin_x_nft.getStatus(listing.listingId));

      const erc20_usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
      console.log('usdc @', USDC_ADDRESS, erc20_usdc);
      console.log('usdc totalSupply', await erc20_usdc.totalSupply());

      console.log('erc20_usdc balance of buyer', buyer_account.address, await erc20_usdc.balanceOf(buyer_account.address));
      console.log('erc20_usdc balance of marketplace', penguin_x_marketplace.address, await erc20_usdc.balanceOf(penguin_x_marketplace.address));
      console.log('erc20_usdc balance of seller', seller_account.address, await erc20_usdc.balanceOf(seller_account.address));


      // Mark Delivery In Progress Failed  (status 4)
      console.log('verifying delivery status failed (status 4)');
      const vds_4_tx = await penguin_x_marketplace.connect(penguin_verifier).verifyDeliveryStatus(listing.listingId, 4);
      const vds_4_txReceipt = await vds_4_tx.wait();
      console.log('vds_4_txReceipt', vds_4_txReceipt);

      console.log('status', await penguin_x_nft.getStatus(listing.listingId));
      

      console.log('erc20_usdc balance of buyer', buyer_account.address, await erc20_usdc.balanceOf(buyer_account.address));
      console.log('erc20_usdc balance of marketplace', penguin_x_marketplace.address, await erc20_usdc.balanceOf(penguin_x_marketplace.address));
      console.log('erc20_usdc balance of seller', seller_account.address, await erc20_usdc.balanceOf(seller_account.address));
    })

  });
});