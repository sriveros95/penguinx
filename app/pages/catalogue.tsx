import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Link from "next/link";
// import { useWeb3 } from "@3rdweb/hooks";
import {
  MediaRenderer,
  useActiveListings,
  useContract,
  useAddress,
  useSDK,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
const { PENGUIN_X_MARKETPLACE_ADDRESS } = require("../../contracts");
import { Network, Alchemy } from "alchemy-sdk";
import { ABI_NFT } from "../abis";
import { useState } from "react";
// const { ethers } = require("hardhat");

var _ = require('lodash');
// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: "5W77MmIijUWconkEcgCD59eFaItZG3du",         // Replace with your Alchemy API Key.
  network: Network.ETH_GOERLI, // Replace with your network.
};

const alchemy = new Alchemy(settings);

let loaded = false
let loadedListing = false

const Home: NextPage = () => {
  const router = useRouter();
  const sdk = useSDK();

  // Connect your marketplace smart contract here (replace this address)
  const { contract: marketplace } = useContract(
    PENGUIN_X_MARKETPLACE_ADDRESS, // Your marketplace contract address here
    "marketplace"
  );

  const address = useAddress();
  const [mpxn, setMpxn] = useState([]);
  const [myUnverified, setMyUnverified] = useState([]);
  const [listado, setListado] = useState([]);

  if (!loaded && address) {
    console.log('all nfts for ', address);

    // Print all NFTs returned in the response:
    console.log('la hora es ', new Date().getTime());

    alchemy.nft.getNftsForOwner(address ? address : '').then((resp: any) => {
      let nfts = resp.ownedNfts;
      console.log(`loaded nfts`, nfts);
      function penguinFilter(listing: any) {
        console.log('penguinFilter', listing);
        const properties = _.get(listing, 'rawMetadata.properties[0]');
        return (properties && properties['name'] == 'PenguinXVersion')
      }
      let filtered = _.filter(nfts, penguinFilter);
      setMpxn(filtered);
      console.log('setMpxn', filtered);
      setMyUnverified(_.filter(filtered, async (nft: any) => {
        // Connect to our marketplace contract via the useContract hook
        // const { contract: penguin_x_nft } = useContract(
        //   nft.contract.address, // Your marketplace contract address here
        //   ABI_NFT,
        // );
        // const penguin_x_nft = ethers.getContractAt("PenguinXNFT", nft.contract.address);
        const contract = await sdk?.getContractFromAbi(nft.contract.address, ABI_NFT);

        console.log('nft', nft, 'contract loaded:', contract);
        return await contract?.call('getVerifier') == "0x0000000000000000000000000000000000000000"
      }));
      // console.log('mpxn2', mpxn2);
      // console.log('set val', mpxn);

    });

    loaded = true;
  }



  var { isLoading: loadingListings } =
    useActiveListings(marketplace);
  console.log('listings', listado);
  console.log('marketplace', marketplace);
  if (!loadedListing) {
    
    marketplace?.getAll().then((l: any) => {
      console.log('promised listings', l);
      setListado(l);
      loadedListing = true;
    })

    // console.log(marketplace?.direct.getActiveListings());
    
  }




  return <>
    {/* Content */}
    <div className={styles.container}>
      {/* Top Section */}
      <div className="main">
        {
          // If the listings are loading, show a loading message
          loadingListings ? (
            <div>Loading listings...</div>
          ) : (
            // Otherwise, show the listings
            <div>
              <div>
                <p className={styles.sub2}>Check out all the cool stuff</p>
              </div>
              <div className={styles.listingGrid}>
                {listado?.map((listing: any) => (
                  <div
                    key={listing.id}
                    className={styles.listingShortView}
                    onClick={() => router.push(`/listing/${listing.id}`)}
                  >
                    <MediaRenderer
                      src={listing.asset.image}
                      style={{
                        borderRadius: 20,
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