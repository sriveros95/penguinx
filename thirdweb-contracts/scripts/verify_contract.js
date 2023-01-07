const USE_NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS } = require("../../contracts.ts");
const PENGUIN_X_NFT_ADDRESS = "0x0a965facf7895e6a091ba53852dc8720cba90493"; // CONTRACT TO VERIFY;
// 0x938c090d317ddfa6dd3c0c9303a7701f1ac273f6

async function main() {
    const [penguin_master, penguin_verifier] = await ethers.getSigners();

    console.log("Verifying nft with the account:", penguin_verifier.address);

    // console.log("Account balance:", (await penguin_master.getBalance()).toString());

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

    // Set verifier
    console.log("verifying", PENGUIN_X_NFT_ADDRESS);

    let resp = await penguin_x_quarters.connect(penguin_verifier).verify(PENGUIN_X_NFT_ADDRESS, [40000, 200000], {
        // gasPrice: 17670,
        // gasLimit: 199397
    })
    console.log('verified resp', resp);
    resp = await resp.wait();
    console.log('verified resp awaited', resp);

    let listresp = await penguin_x_marketplace.connect(penguin_verifier).createListing(PENGUIN_X_NFT_ADDRESS);
    console.log('listresp', listresp);
    listresp = await listresp.wait();
    console.log('listresp awaited', listresp);
    

    const penguin_x_nft = await ethers.getContractAt("PenguinXNFT", PENGUIN_X_NFT_ADDRESS);
    console.log('penguin_x_nft verifier', await penguin_x_nft.getVerifier());

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });