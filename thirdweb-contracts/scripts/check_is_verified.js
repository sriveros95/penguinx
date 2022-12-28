const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const PENGUIN_X_NFT_ADDRESS = "0xa85f9be78a30bce4debf6b40441a4f756dec766b";
const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS } = require("../../contracts.ts");

async function main() {
    const [penguin_master, penguin_verifier, seller_account] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", penguin_master.address);

    console.log("Account balance:", (await penguin_master.getBalance()).toString());

    const penguin_x_nft = await ethers.getContractAt("PenguinXNFT", PENGUIN_X_NFT_ADDRESS);

    console.log('penguin_x_nft loaded from', penguin_x_nft.address);
    
    console.log('verifier', await penguin_x_nft.getVerifier());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });