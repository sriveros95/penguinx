const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_NFT_ADDRESS } = require("../../contracts.ts");

const LISTING_ID = 4; // LISTING WE ARE VERIFYING THE DELIVERY STATUS
// const DELIVERY_STATUS = 31; // Verified delivery
// const DELIVERY_STATUS = 29; // delivery NOT verified
const DELIVERY_STATUS = 4; // delivery NOT verified return escrow

async function main() {
    const [penguin_master, penguin_verifier] = await ethers.getSigners();

    console.log("Verifying nft delivery with the account:", penguin_verifier.address);

    // console.log("Account balance:", (await penguin_master.getBalance()).toString());
    const penguin_x_marketplace = await ethers.getContractAt("PenguinXMarketPlace", PENGUIN_X_MARKETPLACE_ADDRESS);

    console.log('penguin_x_marketplace loaded from', penguin_x_marketplace.address);

    // Set verifier
    console.log("verifying delivery", PENGUIN_X_MARKETPLACE_ADDRESS, LISTING_ID);
    const vds_tx = await penguin_x_marketplace.connect(penguin_verifier).verifyDeliveryStatus(LISTING_ID, DELIVERY_STATUS);

    console.log('verifyDeliveryStatus resp', vds_tx);
    const resp = await vds_tx.wait();
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