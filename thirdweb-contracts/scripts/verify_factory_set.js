const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS } = require("../../contracts.ts");

async function main() {
    const [penguin_master, penguin_verifier] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", penguin_master.address);

    console.log("Account balance:", (await penguin_master.getBalance()).toString());

    const penguin_x_factory = await ethers.getContractAt("PenguinXFactory", PENGUIN_X_FACTORY_ADDRESS);
    const penguin_x_marketplace = await ethers.getContractAt("PenguinXMarketPlace", PENGUIN_X_MARKETPLACE_ADDRESS);
    const penguin_x_quarters = await ethers.getContractAt("PenguinXQuarters", PENGUIN_X_QUARTERS_ADDRESS);

    console.log('penguin_x_factory loaded from', penguin_x_factory.address);
    console.log('penguin_x_marketplace loaded from', penguin_x_marketplace.address);
    console.log('penguin_x_quarters loaded from', penguin_x_quarters.address);

    // Set verifier
    console.log("Should only allow penguin_master to set verifier", penguin_verifier.address);

    const factory_address = await penguin_x_marketplace.PENGUIN_X_FACTORY_ADDRESS();
    console.log('penguin_x_marketplace says factory_address is', factory_address, 'match?', factory_address == penguin_x_factory.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });