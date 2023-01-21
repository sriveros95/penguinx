const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS, PENGUIN_X_NFT_ADDRESS } = require("../../contracts.ts");
const LISTING_ID = 1;

async function main() {
    const [penguin_master, penguin_verifier, seller_account, buyer_account, random_account] = await ethers.getSigners();

    console.log("getting LISTING_ID", LISTING_ID, "delivery with the account:", penguin_verifier.address);

    const penguin_x_marketplace = await ethers.getContractAt("PenguinXMarketPlace", PENGUIN_X_MARKETPLACE_ADDRESS);
    console.log('penguin_x_nft address set in marketplace', await penguin_x_marketplace.PENGUIN_X_NFT());

    // console.log( 'penguin_x_marketplace getListingRequest', await penguin_x_marketplace.getListingRequest(LISTING_ID) );
    console.log( 'penguin_x_marketplace getListingRequest', await penguin_x_marketplace.listings(LISTING_ID) );

    console.log( 'penguin_x_marketplace status', await penguin_x_marketplace.status(LISTING_ID) );

    const penguin_x_nft = await ethers.getContractAt("PenguinXNFT", PENGUIN_X_NFT_ADDRESS);
    console.log( 'penguin_x_nft description', await penguin_x_nft.description(LISTING_ID) );

    console.log( 'penguin_x_nft item_name', await penguin_x_nft.item_name(LISTING_ID) );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });