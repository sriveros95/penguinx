const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const PENGUIN_X_NFT_ADDRESS = "0x5d1705601c75478980b61f86f2d2840B498C46EE";
const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS } = require("../../contracts.ts");

async function main() {
    const [penguin_master, penguin_verifier, seller_account] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", penguin_master.address);

    console.log("Account balance:", (await penguin_master.getBalance()).toString());

    const penguin_x_nft = await ethers.getContractAt("PenguinXNFT", PENGUIN_X_NFT_ADDRESS);

    console.log('penguin_x_nft loaded from', penguin_x_nft.address);
    
    console.log(penguin_x_nft);

    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });