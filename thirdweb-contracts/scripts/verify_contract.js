const { PENGUIN_X_FACTORY_ADDRESS, PENGUIN_X_NFT_ADDRESS, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_QUARTERS_ADDRESS } = require("../../contracts.ts");

// Parameters to adjust
const LISTING_ID = 0;
const DELIVERY_USD_CO = 1;
const DELIVERY_USD_US = 2;
const USDC_DECIMALS = 6;
const ONE_WEEK = 7 * 24 * 60 * 60;
const { BigNumber } = require('ethers');

function tokenAmountToWei(amount, decimals) {
    return BigNumber.from("0x" + (amount * 10 ** decimals).toString(16)).toString();
}

async function main() {
    const [penguin_master, penguin_verifier] = await ethers.getSigners();

    console.log("Verifying nft with the account:", penguin_verifier.address);

    // console.log("Account balance:", (await penguin_master.getBalance()).toString());

    const penguin_x_marketplace = await ethers.getContractAt("PenguinXMarketPlace", PENGUIN_X_MARKETPLACE_ADDRESS);

    console.log('penguin_x_marketplace loaded from', penguin_x_marketplace.address);

    // Set verifier
    console.log("Should only allow penguin_master to set verifier", penguin_verifier.address);

    // Getting prices

    // fetch("https://services.deprisa.com/api/Cotizaciones/Cotizar", {
    //     "headers": {
    //       "accept": "application/json, text/javascript, */*; q=0.01",
    //       "accept-language": "en-US,en;q=0.9",
    //       "cache-control": "no-cache",
    //       "content-type": "application/json;chartset=utf-8",
    //       "pragma": "no-cache",
    //       "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\"",
    //       "sec-ch-ua-mobile": "?0",
    //       "sec-ch-ua-platform": "\"macOS\"",
    //       "sec-fetch-dest": "empty",
    //       "sec-fetch-mode": "cors",
    //       "sec-fetch-site": "same-site"
    //     },
    //     "referrer": "https://www.deprisa.com/",
    //     "referrerPolicy": "strict-origin-when-cross-origin",
    //     "body": "{\"Admision\":{\"Tipo_Envio\":\"I\",\"Numero_Bultos\":1,\"Kilos\":\"1\",\"Cliente_Remitente\":\"99999999\",\"Centro_remitente\":\"99\",\"Pais_Origen\":\"057\",\"Ciudad_Origen\":\"YUMBO\",\"Pais_Destino\":\"124\",\"Ciudad_Destino\":\"\",\"Incoterm\":\"\",\"Codigo_Servicio\":\"\",\"Largo\":\"1\",\"Ancho\":\"1\",\"Alto\":\"1\",\"Tipo_Mercancia\":\"\",\"Contenedor_Mercancia\":\"C\",\"Importe_Valor_Declarado\":\"120000\",\"Tipo_Moneda\":\"COP\"}}",
    //     "method": "POST",
    //     "mode": "cors",
    //     "credentials": "omit"
    //   });

    // fetch("https://world.openfoodfacts.org/category/pastas/1.json")
    //     .then(response => {
    //         // indicates whether the response is successful (status code 200-299) or not
    //         if (!response.ok) {
    //         throw new Error(`Request failed with status ${reponse.status}`)
    //         }
    //         return response.json()
    //     })
    //     .then(data => {
    //         console.log(data.count)
    //         console.log(data.products)
    //     })
    //     .catch(error => console.log(error))

    // // Set verifier
    // console.log("verifying", PENGUIN_X_NFT_ADDRESS, LISTING_ID);

    // let resp = await penguin_x_marketplace.connect(penguin_verifier).createListing(LISTING_ID, [0, tokenAmountToWei(DELIVERY_USD_CO, USDC_DECIMALS), tokenAmountToWei(DELIVERY_USD_US, USDC_DECIMALS)], ONE_WEEK, {
    //     // gasPrice: 17670,
    //     // gasLimit: 199397
    // })
    // console.log('verified resp', resp);
    // resp = await resp.wait();
    // console.log('verified resp awaited', resp);

    const penguin_x_nft = await ethers.getContractAt("PenguinXNFT", PENGUIN_X_NFT_ADDRESS);
    console.log('penguin_x_nft verifier', await penguin_x_nft.verifier(LISTING_ID));
    console.log('penguin_x_nft status', await penguin_x_marketplace.status(LISTING_ID));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });