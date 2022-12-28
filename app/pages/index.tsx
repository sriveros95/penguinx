import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Link from "next/link";
// import { useWeb3 } from "@3rdweb/hooks";
import {
  MediaRenderer,
  useActiveListings,
  useContract,
  useAddress
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
const { PENGUIN_X_MARKETPLACE_ADDRESS } = require("../../contracts.ts");
import { Network, Alchemy } from "alchemy-sdk";
import { ABI_MARKETPLACE } from "../contract";
import { useState } from "react";
const { ALCHEMY_KEY } = require("../../apis.ts");
var _ = require('lodash');
// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: ALCHEMY_KEY,         // Replace with your Alchemy API Key.
  network: Network.ETH_GOERLI, // Replace with your network.
};

const alchemy = new Alchemy(settings);

let loaded = false


const Home: NextPage = () => {
  const router = useRouter();

  // Connect your marketplace smart contract here (replace this address)
  const { contract: marketplace } = useContract(
    PENGUIN_X_MARKETPLACE_ADDRESS, // Your marketplace contract address here
    "marketplace"
  );

  const address = useAddress();
  const [mpxn, setMpxn] = useState([]);

  if (!loaded && address) {
    console.log('all nfts for ', address);

    // Print all NFTs returned in the response:
    console.log('la hora es ', new Date().getTime());

    alchemy.nft.getNftsForOwner(address ? address : '').then(resp => {
      let nfts = resp.ownedNfts;
      console.log(`loaded nfts`, nfts);
      function penguinFilter(listing: any) {
        console.log('penguinFilter', listing);
        const properties = _.get(listing, 'rawMetadata.properties[0]');
        return (properties && properties['name'] == 'PenguinXVersion')
      }
      setMpxn(_.filter(nfts, penguinFilter));
      // mpxn = mpxn.map((nft: any) => {
      //   // Connect to our marketplace contract via the useContract hook
      //   const { contract: penguin_x_nft } = useContract(
      //     nft.contract.address, // Your marketplace contract address here
      //     ABI_MARKETPLACE,
      //   );
      // })
      console.log('filtered', mpxn);
    });

    loaded = true;
  }



  const { data: listings, isLoading: loadingListings } =
    useActiveListings(marketplace);

  return <>
    {/* Content */}
    <div className={styles.container}>
      {/* Top Section */}
      <h1 className={styles.h1}>Buy and sell stuff with crypto, <br />no intermediaries, no fees!</h1>
      <p className={styles.explain}>
        The P2P exchange, only for{" "}
        <b>
          {" "}
          <a
            className={styles.orange}
          >
            cool
          </a>
        </b>{" "}
        stuff. 😎
      </p>

      <hr className={styles.divider} />

      <div style={{ marginTop: 32, marginBottom: 32 }}>
        <Link
          href="/create"
          className={styles.mainButton}
          style={{ textDecoration: "none" }}>

          Create A Listing

        </Link>
      </div>

      <div className="main">
        {
          // If the listings are loading, show a loading message
          loadingListings ? (
            <div>Loading listings...</div>
          ) : (
            // Otherwise, show the listings
            <div>
              <div>
                <p className={styles.sub2}>Pending verification:</p>
              </div>
              <div className={styles.listingGrid}>
                {mpxn?.map((listing: any) => (
                  <div
                    key={listing.contract.address}
                    className={styles.listingShortView}
                    onClick={() => router.push(`/listing/${listing.contract.address}`)}
                  >
                    <MediaRenderer
                      src={`https://cloudflare-ipfs.com/ipfs/${listing.rawMetadata.image.split('ipfs://')[1]}`}
                      style={{
                        borderRadius: 16,
                        // Fit the image to the container
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    <h2 className={styles.nameContainer}>
                      <Link href={`/listing/${listing.contract.address}`} className={styles.name}>
                        {listing.rawMetadata.name}
                      </Link>
                    </h2>

                    {/* <p className={styles.light}>
                      {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
                      {listing.buyoutCurrencyValuePerToken.symbol}
                    </p> */}
                  </div>
                ))}
              </div>
              <div>
                <p className={styles.sub2}>Check out all the cool stuff</p>
              </div>
              <div className={styles.listingGrid}>
                {listings?.map((listing) => (
                  <div
                    key={listing.id}
                    className={styles.listingShortView}
                    onClick={() => router.push(`/listing/${listing.id}`)}
                  >
                    <MediaRenderer
                      src={listing.asset.image}
                      style={{
                        borderRadius: 16,
                        // Fit the image to the container
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    <h2 className={styles.nameContainer}>
                      <Link href={`/listing/${listing.id}`} className={styles.name}>
                        {listing.asset.name}
                      </Link>
                    </h2>

                    <p className={styles.light}>
                      {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
                      {listing.buyoutCurrencyValuePerToken.symbol}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      </div>
    </div>
  </>;
};

export default Home;