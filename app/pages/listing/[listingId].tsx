import {
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useListing,
  useContract,
  useAddress,
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

  // Fetch the listing from the marketplace contract
  const { data: listing, isLoading: loadingListing } = useListing(
    marketplace,
    listingId
  );


  const { contract: penguin_x_nft } = useContract(
    listing?.assetContractAddress, // Your marketplace contract address here
    ABI_NFT,
  );


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

  if (!listing) {
    return <div className={styles.loadingOrError}>Listing not found</div>;
  }

  async function createBidOrOffer() {
    try {
      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(ChainId.Goerli);
        return;
      }

      // If the listing type is a direct listing, then we can create an offer.
      if (listing?.type === ListingType.Direct) {
        await marketplace?.direct.makeOffer(
          listingId, // The listingId of the listing we want to make an offer for
          1, // Quantity = 1
          NATIVE_TOKENS[ChainId.Goerli].wrapped.address, // Wrapped Ether address on Goerli
          bidAmount // The offer amount the user entered
        );
      }

      // If the listing type is an auction listing, then we can create a bid.
      if (listing?.type === ListingType.Auction) {
        await marketplace?.auction.makeBid(listingId, bidAmount);
      }

      alert(
        `${listing?.type === ListingType.Auction ? "Bid" : "Offer"
        } created successfully!`
      );
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  async function buyNft(e: any) {
    try {
      e.preventDefault();
      const { deliveryZone, deliveryData } = e.target.elements;
      console.log('buyNft', deliveryZone, deliveryData);

      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(ChainId.Goerli);
        return;
      }

      // Simple one-liner for buying the NFT
      // await marketplace?.buyoutListing(listingId, 1);
      console.log('penguin_marketplace', penguin_marketplace);

      penguin_x_nft?.call('getPrice', parseInt(deliveryZone.value)).then((totalPrice) => {
        console.log('totalPrice to', deliveryZone.value, 'is', totalPrice, totalPrice.toNumber());

        // approve marketplace
        usdc?.call('approve',
          PENGUIN_X_MARKETPLACE_ADDRESS,
          totalPrice.toNumber()
        ).then(() => {
          alert("spend usdc approved successfully!");
          penguin_marketplace?.call('buy',
            listing?.id,
            address,
            1,
            USDC_ADDRESS,
            totalPrice.toNumber(),
            parseInt(deliveryZone.value),
            utils.formatBytes32String(deliveryData.value)
          ).then(() => {
            alert("NFT bought successfully!");
          })
        })
      })
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  return (
    <div className={styles.container} style={{}}>
      <div className={styles.listingContainer}>
        <div className={styles.leftListing}>
          <MediaRenderer
            src={listing.asset.image}
            className={styles.mainNftImage}
          />
        </div>

        <div className={styles.rightListing}>
          <h1 className={styles.h1}>{listing.asset.name}</h1>
          <p className={styles.owner}>
            <span className={styles.mid}>Owner</span>  {listing.sellerAddress?.slice(0, 6) +
              "..." +
              listing.sellerAddress?.slice(36, 40)}
          </p>

          <p className={styles.sub}>Details</p>

          <p className={styles.description}>{listing.asset.description}</p>

          <p className={styles.sub}>Price</p>

          <h2 className={styles.price}>
            {listing.buyoutCurrencyValuePerToken.displayValue} {" "}
            {listing.buyoutCurrencyValuePerToken.symbol}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 20,
              alignItems: "center",
            }}
          >
            <form onSubmit={(e) => buyNft(e)}>
              <div >
                {/* Form Section */}
                <div className={styles.collectionContainer}>
                  <h1 className={styles.sub}>
                    Delivery details <br/>
                  </h1>

                  {/* Toggle between direct listing and auction listing */}
                  <div className={styles.listingTypeContainer}>
                    <input
                      type="radio"
                      name="deliveryZone"
                      id="colombia"
                      value="0"
                      defaultChecked
                      className={styles.listingType}
                    />
                    <label htmlFor="colombia" className={styles.listingTypeLabel}>
                      Colombia
                    </label>
                    <input
                      type="radio"
                      name="deliveryZone"
                      id="united_states"
                      value="1"
                      defaultChecked
                      className={styles.listingType}
                    />
                    <label htmlFor="united_states" className={styles.listingTypeLabel}>
                      United States
                    </label>
                  </div>

                    <p className={styles.sub}>Delivery address</p>

                    {/* NFT Contract Address Field */}
                    <input
                      type="text"
                      name="deliveryData"
                      className={styles.textInput}
                      placeholder="Address"
                    />

                  {/* <input id="file-upload" type="file" onChange={(e) => setFile(
              // @ts-ignore: Object is possibly 'null'
              e?.target?.files[0])} /> */}


                  <button
                    type="submit"
                    style={{ borderStyle: "none" }}
                    className={styles.buyButton}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </form>


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
