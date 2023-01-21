const NATIVE_CURRENCY_WRAPPER = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const PENGUIN_X_MARKETPLACE_ADDRESS = "0x8ac93B9d5043C2a119Da883d963C640Ab6d88158";

async function main() {
    const [penguin_master, penguin_verifier] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", penguin_master.address);

    console.log("Account balance:", (await penguin_master.getBalance()).toString());

    // // Deploy modified Thirweb Marketplace
    // const PenguinXMarketplace = await ethers.getContractFactory("PenguinXMarketPlace");
    // const penguin_x_marketplace = await PenguinXMarketplace.connect(penguin_master).deploy(
    //     NATIVE_CURRENCY_WRAPPER,
    //     penguin_master.address,
    //     'https://penguinx.xyz/uri/',
    //     [penguin_master.address]
    //     // penguin_master.address,
    //     // 10000
    // );

    // await penguin_x_marketplace.deployed();
    // console.log('penguin_marketplace has been deployed @', penguin_x_marketplace.address);


    // // Set verifier
    // console.log("Should only allow penguin_master to set verifier");
    // await penguin_x_marketplace.connect(penguin_master).setVerifier(penguin_verifier.address, true)
    // console.log('penguin_verifier has been set');

    const penguin_x_marketplace = await ethers.getContractAt("PenguinXMarketPlace", PENGUIN_X_MARKETPLACE_ADDRESS);

    // Deploy Penguin X NFT
    const PenguinXNFT = await ethers.getContractFactory("PenguinXNFT");
    const penguin_x_nft = await PenguinXNFT.connect(penguin_master).deploy(
        "Penguin X NFT",
        penguin_x_marketplace.address
    );

    await penguin_x_nft.deployed();
    console.log('penguin_x_nft has been deployed @', penguin_x_nft.address);

    // Set penguin_x_nft address in marketplace
    await penguin_x_marketplace.connect(penguin_master).setPenguinXNFT(penguin_x_nft.address);
    console.log('penguin_x_nft address set in marketplace', await penguin_x_marketplace.PENGUIN_X_NFT());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });