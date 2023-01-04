const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS } = require("../../contracts.ts");
const PENGUIN_X_NFT_ADDRESS = "0xee737c024404f196c4037f4fdf9310c70ed263fb"; // CONTRACT TO VERIFY;
// 0x938c090d317ddfa6dd3c0c9303a7701f1ac273f6

async function main() {
    const [penguin_master, penguin_verifier, seller_account, buyer_account, random_account] = await ethers.getSigners();

    console.log("Verifying nft with the account:", penguin_verifier.address);

    const penguin_x_nft = await ethers.getContractAt("PenguinXNFT", PENGUIN_X_NFT_ADDRESS);
    console.log('penguin_x_nft verifier', await penguin_x_nft.getVerifier());

    let resp = await penguin_x_nft.connect(seller_account).getDeliveryData()
    console.log('resp', resp);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });