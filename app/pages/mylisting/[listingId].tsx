import {
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useListing,
  useContract,
  useAddress,
  useContractWrite,
  useContractRead,
} from "@thirdweb-dev/react";
import {
  ChainId,
  ListingType,
  NATIVE_TOKENS,
} from "@thirdweb-dev/sdk";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { ABI_ERC20, ABI_MARKETPLACE, ABI_NFT } from "../../abis";
const { PENGUIN_X_MARKETPLACE_ADDRESS, USDC_ADDRESS } = require("../../../contracts.ts");
const { utils } = require("ethers");
import styles from "../../styles/Home.module.css";

const ListingPage: NextPage = () => {
  // Next JS Router hook to redirect to other pages and to grab the query from the URL (listingId)
  const router = useRouter();
  const address = useAddress();

  // De-construct listingId out of the router.query.
  // This means that if the user visits /listing/0 then the listingId will be 0.
  // If the user visits /listing/1 then the listingId will be 1.
  const { listingId } = router.query as { listingId: string };

  // Hooks to detect user is on the right network and switch them if they are not
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const [listado, setListado] = useState();

  const { contract: penguin_marketplace } = useContract(
    PENGUIN_X_MARKETPLACE_ADDRESS, // Your marketplace contract address here
    ABI_MARKETPLACE,
  );

  // let penguin_marketplace: any;
  // ethers.getContractAt("PenguinXNFT", PENGUIN_X_MARKETPLACE_ADDRESS).then((res: any) => {
  //   penguin_marketplace = res;
  //   console.log('penguin_marketplace set', penguin_marketplace);
  // })

  console.log('penguin_marketplace', penguin_marketplace);

  // Initialize the marketplace contract
  const { contract: marketplace } = useContract(
    PENGUIN_X_MARKETPLACE_ADDRESS, // Your marketplace contract address here
    "marketplace"
  );


  const { contract: penguin_x_nft, isLoading: loadingListing } = useContract(
    listingId, // Your marketplace contract address here
    ABI_NFT,
  );
  console.log('penguin_x_nft', penguin_x_nft);
  const { data: name, isLoading: loadingName } = useContractRead(
    penguin_x_nft,
    "name", // The name of the function on your contract
  );
  const { data: verifier, isLoading: loadingStatus } = useContractRead(
    penguin_x_nft,
    "getVerifier", // The name of the function on your contract
  );

  console.log('loading delivery for', address);

  const { data: deliveryData, isLoading: loadingDeliveryData } = useContractRead(
    penguin_x_nft,
    "getDeliveryData", // The name of the function on your contract,
  );

  if (penguin_x_nft) {
    console.log('loading delivery repso', address);
    // penguin_x_nft.call('getDeliveryData', {from: address}).then((respo) => {
    //   console.log('respo', respo);
    // })
    penguin_x_nft.call('ownerOf', 0, {from: address}).then((respo) => {
      console.log('ownerOf', respo, respo == address);
    })
  }


  const { contract: usdc } = useContract(
    USDC_ADDRESS,
    ABI_ERC20
  );
  console.log('usdc contract', usdc);

  // Store the bid amount the user entered into the bidding textbox
  const [bidAmount, setBidAmount] = useState<string>("");

  if (loadingListing) {
    return <div className={styles.loadingOrError}>Loading...</div>;
  }

  if (!penguin_x_nft) {
    return <div className={styles.loadingOrError}>Listing not found</div>;
  }

  // async function buyNft(e: any) {
  //   try {
  //     e.preventDefault();
  //     const { deliveryZone, deliveryData } = e.target.elements;
  //     console.log('buyNft', deliveryZone, deliveryData);

  //     // Ensure user is on the correct network
  //     if (networkMismatch) {
  //       switchNetwork && switchNetwork(ChainId.Goerli);
  //       return;
  //     }

  //     // Simple one-liner for buying the NFT
  //     // await marketplace?.buyoutListing(listingId, 1);
  //     console.log('penguin_marketplace', penguin_marketplace);

  //     penguin_x_nft?.call('getPrice', parseInt(deliveryZone.value)).then((totalPrice) => {
  //       console.log('totalPrice to', deliveryZone.value, 'is', totalPrice, totalPrice.toNumber());

  //       // approve marketplace
  //       usdc?.call('approve',
  //         PENGUIN_X_MARKETPLACE_ADDRESS,
  //         totalPrice.toNumber()
  //       ).then(() => {
  //         alert("spend usdc approved successfully!");
  //         penguin_marketplace?.call('buy',
  //           listing?.id,
  //           address,
  //           1,
  //           USDC_ADDRESS,
  //           totalPrice.toNumber(),
  //           parseInt(deliveryZone.value),
  //           utils.formatBytes32String(deliveryData.value)
  //         ).then(() => {
  //           alert("NFT bought successfully!");
  //         })
  //       })
  //     })
  //   } catch (error) {
  //     console.error(error);
  //     alert(error);
  //   }
  // }

  return (
    <div className={styles.container} style={{}}>
      <div className={styles.listingContainer}>
        <div className={styles.leftListing}>
          {/* <MediaRenderer
            src={penguin_x_nft.asset.image}
            className={styles.mainNftImage}
          /> */}
        </div>

        <div className={styles.rightListing}>
          <h1 className={styles.h1}>{name}</h1>

          <p>Verificado por: {verifier}</p>

          <p>deliveryData: {deliveryData}</p>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 20,
              alignItems: "center",
            }}
          >

            {/* <p style={{ color: "grey" }}>|</p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <input
                  type="text"
                  name="bidAmount"
                  className={styles.textInput}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Amount"
                  style={{ marginTop: 0, marginLeft: 0, width: 128 }}
                />
                <button
                  className={styles.mainButton}
                  onClick={createBidOrOffer}
                  style={{
                    borderStyle: "none",
                    background: "transparent",
                    width: "fit-content",
                  }}
                >
                  Make Offer
                </button>
              </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;
