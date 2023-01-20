import type { NextPage } from "next";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
// import HttpApi from 'i18next-http-backend';
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
const { PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_VERSION } = require("../../contracts");
import { Network, Alchemy } from "alchemy-sdk";
import { ABI_NFT } from "../abis";
import { useState } from "react";
// const { ethers } = require("hardhat");

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  // .use(HttpApi)
  .init({
    supportedLngs: ['en', 'es'],
    fallbackLng: 'en',
    detection: {
      order: ['cookie', 'htmlTag', 'localStorage', 'sessionStorage', 'navigator', 'path', 'subdomain'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/assets/locales/{{lng}}/translation.json',
    },
    react: { useSuspense: false},
  });

var _ = require('lodash');
// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: "5W77MmIijUWconkEcgCD59eFaItZG3du",         // Replace with your Alchemy API Key.
  // network: Network.ETH_GOERLI, // Replace with your network.
  network: Network.MATIC_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

let loaded = false
let loadedListing = false
let retriedListings = 0;

function availFilter(listing: any) {
  console.log('availFilter', listing);
  return listing.quantity.toNumber() > 0
}

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
        return (properties && properties['name'] == 'PenguinXVersion' && properties['value'] == PENGUIN_X_VERSION)
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
        // return await contract?.call('getVerifier') == "0x0000000000000000000000000000000000000000"
        return false
      }));
      // console.log('mpxn2', mpxn2);
      // console.log('set val', mpxn);

    });

    loaded = true;
  }



  var { data: listings, isLoading: loadingListings } = useActiveListings(marketplace);
  console.log('listado', listado);
  console.log('listings', listings);
  
  console.log('marketplace', marketplace);
  if (listings && (!loadedListing || !listado.length) && retriedListings < 5) {
    let filtered = _.filter(listings, availFilter);
    console.log('filtered listings', filtered);
    setListado(filtered);
    loadedListing = true;
    retriedListings ++;
    
    
    // marketplace?.getAll().then((l: any) => {
    //   console.log('promised listings', l);
    //   setListado(l);
    //   loadedListing = true;
    // })

    // console.log(marketplace?.direct.getActiveListings());
    
  }
  

  const { t } = useTranslation();


  return <>
  
    {/* Content */}
    <div className={styles.container}>
      {/* Top Section */}
      
      <h1 className={styles.h1}>Buy and sell <span className={styles.orange}>handcrafts</span> with crypto!</h1>
      <p className={styles.explain}>
      Shop for unique pieces from artisans, or list your cool crafts!<br/>Sign in with MetaMask.
      </p>

      <div className={styles.containerHeader}>
        <div style={{ marginTop: 32, marginBottom: 32 }}>
          <Link
            href="/create"
            className={styles.mainButton}
            style={{ textDecoration: "none" }}>

            Sell Your Craft

          </Link>
        </div>
        <div style={{ marginTop: 32, marginBottom: 32 }}>
          <Link
            href="/catalogue"
            className={styles.mainButton}
            style={{ textDecoration: "none" }}>

            Shop Cool Stuff

          </Link>
          </div>
      </div>

      <hr className={styles.divider} />

      <div className="main">
        {
          // If the listings are loading, show a loading message
          loadingListings ? (
            <div>Loading listings...</div>
          ) : (
            // Otherwise, show the listings
            <div>
              <div>
                <p className={styles.sub2}>Your listings</p>
              </div>
              <div className={styles.listingGrid}>
                {mpxn?.map((listing: any) => (
                  
                  <div
                    key={listing.contract.address}
                    className={styles.listingShortView}
                    onClick={() => router.push(`/mylisting/${listing.contract.address}`)}
                  >
                    <MediaRenderer
                      src={listing.rawMetadata.image ? `https://cloudflare-ipfs.com/ipfs/${listing.rawMetadata.image.split('ipfs://')[1]}` : ''}
                      style={{
                        borderRadius: 20,
                        // Fit the image to the container
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    <h2 className={styles.nameContainer}>
                      <Link href={`/mylisting/${listing.contract.address}`} className={styles.name}>
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
                <p className={styles.sub2}>Unverified listings</p>
              </div>
              <div className={styles.listingGrid}>
                {myUnverified?.map((listing: any) => (
                  <div
                    key={listing.contract.address}
                    className={styles.listingShortView}
                    onClick={() => router.push(`/mylisting/${listing.contract.address}`)}
                  >
                    <MediaRenderer
                      src={listing.rawMetadata.image ? `https://cloudflare-ipfs.com/ipfs/${listing.rawMetadata.image.split('ipfs://')[1]}` : ''}
                      style={{
                        borderRadius: 20,
                        // Fit the image to the container
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    <h2 className={styles.nameContainer}>
                      <Link href={`/mylisting/${listing.contract.address}`} className={styles.name}>
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