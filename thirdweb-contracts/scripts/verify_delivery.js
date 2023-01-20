const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS } = require("../../contracts.ts");
const PENGUIN_X_NFT_ADDRESS = "0x8b030821551859eda74091ca3f1c541084f7788e"; // STUFF TO VERIFY COOLNESS;

async function main() {
    const [penguin_master, penguin_verifier] = await ethers.getSigners();

    console.log("Verifying nft delivery with the account:", penguin_verifier.address);

    // console.log("Account balance:", (await penguin_master.getBalance()).toString());

    const penguin_x_factory = await ethers.getContractAt("PenguinXFactory", PENGUIN_X_FACTORY_ADDRESS);
    const penguin_x_marketplace = await ethers.getContractAt("PenguinXMarketPlace", PENGUIN_X_MARKETPLACE_ADDRESS);
    const penguin_x_quarters = await ethers.getContractAt("PenguinXQuarters", PENGUIN_X_QUARTERS_ADDRESS);

    console.log('penguin_x_factory loaded from', penguin_x_factory.address);
    console.log('penguin_x_marketplace loaded from', penguin_x_marketplace.address);
    console.log('penguin_x_quarters loaded from', penguin_x_quarters.address);

    const factory_address = await penguin_x_marketplace.PENGUIN_X_FACTORY_ADDRESS();
    console.log('penguin_x_marketplace says factory_address is', factory_address, 'match?', factory_address == penguin_x_factory.address);

    // Set verifier
    console.log("verifying delivery", PENGUIN_X_NFT_ADDRESS);

    const penguin_x_nft = await ethers.getContractAt("PenguinXNFT", PENGUIN_X_NFT_ADDRESS);
    console.log('penguin_x_nft verifier', await penguin_x_nft.getVerifier());
    const listing_info = await penguin_x_nft.getListingInfo();
    console.log('penguin_x_nft listing info', listing_info);
    const listing_id = listing_info['listingId'];
    console.log('penguin_x_nft listing_id', listing_id);

    let resp = await penguin_x_quarters.connect(penguin_verifier).verifyDeliveryStatus(PENGUIN_X_NFT_ADDRESS, 3, {
        // gasPrice: 17670,
        // gasLimit: 199397
    })
    console.log('verifyDeliveryStatus resp', resp);
    resp = await resp.wait();
    console.log('verifyDeliveryStatus resp awaited', resp);

    // let listresp = await penguin_x_marketplace.connect(penguin_verifier).createListing(PENGUIN_X_NFT_ADDRESS);
    // console.log('listresp', listresp);
    // listresp = await listresp.wait();
    // console.log('listresp awaited', listresp);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });