const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS } = require("../../contracts.ts");
const PENGUIN_X_NFT_ADDRESS = "0x8b030821551859eda74091ca3f1c541084f7788e"; // CONTRACT TO VERIFY;

async function main() {
    const [penguin_master, penguin_verifier, seller_account, buyer_account, random_account] = await ethers.getSigners();

    console.log("getting nft delivery with the account:", penguin_verifier.address);

    const penguin_x_nft = await ethers.getContractAt("PenguinXNFT", PENGUIN_X_NFT_ADDRESS);
    console.log('penguin_x_nft verifier', await penguin_x_nft.getVerifier());

    let resp_getDeliveryData = await penguin_x_nft.connect(penguin_verifier).getDeliveryData()
    console.log('getDeliveryData', resp_getDeliveryData);

    try {resp_getDeliveryData = ethers.utils.parseBytes32String(resp_getDeliveryData);} catch (error) {}
    console.log(resp_getDeliveryData);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });