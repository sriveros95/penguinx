const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
    const [penguin_master, penguin_verifier] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", penguin_master.address);

    console.log("Account balance:", (await penguin_master.getBalance()).toString());

    const PenguinXQuarters = await ethers.getContractFactory("PenguinXQuarters");
    const penguin_x_quarters = await PenguinXQuarters.deploy();

    console.log('penguin_x_quarters deployed at', penguin_x_quarters.address);

    // Set verifier
    console.log("Should only allow penguin_master to set verifier");

    await penguin_x_quarters.connect(penguin_master).setVerifier(penguin_verifier.address, true)

    console.log('penguin_verifier has been set');

    // Deploy modified Thirweb Marketplace
    const PenguinXMarketplace = await ethers.getContractFactory("PenguinXMarketPlace");
    const penguin_x_marketplace = await PenguinXMarketplace.connect(penguin_master).deploy(
        USE_NATIVE_CURRENCY,
        penguin_x_quarters.address,
        penguin_master.address,
        'https://penguinx.xyz/uri/',
        [penguin_master.address],
        penguin_master.address,
        10000
    );

    console.log('penguin_marketplace has been deployed @', penguin_x_marketplace.address);

    // Deploy Penguin X Factory
    const PenguinXFactory = await ethers.getContractFactory("PenguinXFactory");
    const penguin_x_factory = await PenguinXFactory.connect(penguin_master).deploy(
        penguin_x_quarters.address,
        penguin_x_marketplace.address
    );

    console.log('penguin_x_factory has been deployed @', penguin_x_factory.address);

    // Set factory address in marketplace
    await penguin_x_marketplace.connect(penguin_master).setFactory(penguin_x_factory.address);
    console.log('penguin_x_factory address set in marketplace', await penguin_x_marketplace.PENGUIN_X_FACTORY_ADDRESS());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });