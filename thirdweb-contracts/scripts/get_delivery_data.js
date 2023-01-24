const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS } = require("../../contracts.ts");
const LISTING_ID = 2; // LISTING TO GET

async function main() {
    const [penguin_master, penguin_verifier, seller_account, buyer_account, random_account] = await ethers.getSigners();

    console.log("getting DeliveryData with the account:", penguin_verifier.address);

    const penguin_x_marketplace = await ethers.getContractAt("PenguinXMarketPlace", PENGUIN_X_MARKETPLACE_ADDRESS);

    const retrievedDeliveryData = await penguin_x_marketplace.connect(penguin_verifier).getDeliveryData(LISTING_ID);
    console.log('retrievedDeliveryData', retrievedDeliveryData);
    try {
        const tracking_code = ethers.utils.toUtf8String(retrievedDeliveryData['tracking_code']);
        console.log('tracking_code', tracking_code);
        const delivery_proof = ethers.utils.toUtf8String(retrievedDeliveryData['delivery_proof']);
        console.log('delivery_proof', delivery_proof);
    } catch (error) {
        console.error('failed decoding', error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });