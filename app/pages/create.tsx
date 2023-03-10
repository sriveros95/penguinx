import {
  useContract,
  useContractWrite,
  useNetwork,
  useNetworkMismatch,
  useSDK,
  useStorageUpload
} from "@thirdweb-dev/react";
import {
  ChainId,
  NATIVE_TOKEN_ADDRESS,
  TransactionResult,
} from "@thirdweb-dev/sdk";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { ABI_MARKETPLACE } from "../abis";
const { PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_NFT_ADDRESS, PENGUIN_X_VERSION } = require("../../contracts.ts");
import styles from "../styles/Home.module.css";
import { useState } from "react";
const { BigNumber } = require('ethers');
import { AiOutlineUpload } from 'react-icons/ai';
import { ethers } from "ethers";
var _ = require('lodash');

// const PENGUIN_X_CHAIN = ChainId.Goerli;
const PENGUIN_X_CHAIN = ChainId.Polygon;



function tokenAmountToWei(amount: any, decimals: any) {
  return BigNumber.from("0x" + (amount * 10 ** decimals).toString(16)).toString();
}


const Create: NextPage = () => {
  // Next JS Router hook to redirect to other pages
  const router = useRouter();
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const { mutateAsync: upload } = useStorageUpload();
  const [file, setFile] = useState();

  // Connect to our marketplace contract via the useContract hook
  const { contract: marketplace } = useContract(
    PENGUIN_X_MARKETPLACE_ADDRESS, // Your marketplace contract address here
    ABI_MARKETPLACE,
  );

  // const { mutate: createListingRequest, isLoading: creatingListingRequest } = useContractWrite(
  //   marketplace,
  //   "createListingRequest", // The name of the function on your contract
  // );

  if (marketplace) {
    marketplace.events.listenToAllEvents((event) => {
      console.log('marketplace event!');
      console.log(event.eventName)  // the name of the emitted event
      console.log(event.data)       // event payload
      if (event.eventName) {
        
      }
    })
  }

  console.log('marketplace: ', marketplace);

  marketplace?.interceptor.overrideNextTransaction(() => ({
    gasLimit: 3000000,
  }));
  // if (marketplace) {
  //   try {
  //     console.log('mira', marketplace.getAll());
  //   } catch (error) {
  //     console.log('didnt load');

  //   }
  // }
  const sdk = useSDK();
  const penguin_x_marketplace = new ethers.Contract(PENGUIN_X_MARKETPLACE_ADDRESS, ABI_MARKETPLACE, sdk?.getSigner());

  // This function gets called when the form is submitted.
  async function handleCreateListing(e: any) {
    console.log('handleCreateListing', e);

    try {
      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(PENGUIN_X_CHAIN);
        return;
      }

      // Prevent page from refreshing
      e.preventDefault();

      // De-construct data from form submission
      const { name, description, listingType, price, weight, height, width, depth } = e.target.elements;
      console.log(name, description);

      // Upload image
      console.log('uploadToIpfs started', e.target.elements);

      const uploadUrl = await upload({
        data: [file],
        options: { uploadWithGatewayUrl: true, uploadWithoutDirectory: true },
      });

      console.log('uploaded to ipfs image', uploadUrl);

      // Upload metadata to ipfs before deploying nft
      const metadata = {
        name: name.value,
        description: description.value,
        // Here we add a file into the image property of our metadata
        image: uploadUrl[0],  // Upload image to ipfs first 
        properties: [
          {
            name: "PenguinXVersion",
            value: PENGUIN_X_VERSION,
          },
          {
            name: "Weight(kg)",
            value: weight.value,
          },
          {
            name: "Height(cm)",
            value: height.value,
          },
          {
            name: "Width(cm)",
            value: width.value,
          },
          {
            name: "Depth(cm)",
            value: depth.value,
          }
        ],
      };
      console.log('uploading metadata', metadata);
      const uris = await upload({ data: [metadata] });
      console.log('metadata uploaded', uris);

      // Store the result of either the direct listing creation or the auction listing creation
      // : undefined | TransactionResult = undefined;

      // Depending on the type of listing selected, call the appropriate function
      // For Direct Listings:
      // if (listingType.value === "directListing") {
      let transactionResult: any = await createDirectListing(
        name.value,
        description.value,
        uris[0],
        price.value,
      );
      // }

      // // // For Auction Listings:
      // // if (listingType.value === "auctionListing") {
      // //   transactionResult = await createAuctionListing(
      // //     name.value,
      // //     tokenId.value,
      // //     price.value
      // //   );
      // // }

      // // If the transaction succeeds, take the user back to the homepage to view their listing!
      if (transactionResult) {
        // router.push(`/`);
        console.log('transactionResult', transactionResult);
      } else {
        console.log('no transactionResult');

      }
    } catch (error) {
      console.error(error);
    }
  }

  // async function createAuctionListing(
  //   name: string,
  //   tokenId: string,
  //   price: string
  // ) {
  //   try {
  //     const transaction = await marketplace?.auction.createListing({
  //       assetContractAddress: contractAddress, // Contract Address of the NFT
  //       buyoutPricePerToken: price, // Maximum price, the auction will end immediately if a user pays this price.
  //       currencyContractAddress: NATIVE_TOKEN_ADDRESS, // NATIVE_TOKEN_ADDRESS is the crpyto curency that is native to the network. i.e. Goerli ETH.
  //       listingDurationInSeconds: 60 * 60 * 24 * 7, // When the auction will be closed and no longer accept bids (1 Week)
  //       quantity: 1, // How many of the NFTs are being listed (useful for ERC 1155 tokens)
  //       reservePricePerToken: 0, // Minimum price, users cannot bid below this amount
  //       startTimestamp: new Date(), // When the listing will start
  //       tokenId: tokenId, // Token ID of the NFT.
  //     });

  //     return transaction;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  async function createDirectListing(
    name: string,
    description: string,
    uri: string,
    price: any
  ) {
    try {
      // the function can be called as follows:
      console.log('calling createListingRequest price is', price);
      price = tokenAmountToWei(price, 6);
      console.log('price elevated', price, price.toString());
      
      const tx = await penguin_x_marketplace.createListingRequest(name, description, uri, price);
    
      console.log('listing request tx:', tx);
      const txReceipt = await tx.wait();
      console.log('listing request events', txReceipt.events);
      const transferEvent = _.find(txReceipt.events, { 'event': 'NewListingRequest' });
      console.log('transferEvent', transferEvent);
      const [listing_request_id] = transferEvent.args;
      console.log('listing request id', listing_request_id);

      return listing_request_id;
    } catch (error) {
      console.error('failed req', error);
    }
  }

  return (
    <div>
      <form onSubmit={(e) => handleCreateListing(e)}>
        <div className={styles.container}>
          {/* Form Section */}
          <div className={styles.createListingContainer}>
            <h1 className={styles.ourCollection}>
              Create a new listing
            </h1>

            {/* Toggle between direct listing and auction listing */}
            <div className={styles.listingTypeContainer}>
              <input
                type="radio"
                name="listingType"
                id="directListing"
                value="directListing"
                defaultChecked
                className={styles.listingType}
              />
              <label htmlFor="directListing" className={styles.listingTypeLabel}>
                Direct Listing
              </label>
              {/* <input
              type="radio"
              name="listingType"
              id="auctionListing"
              value="auctionListing"
              className={styles.listingType}
            />
            <label htmlFor="auctionListing" className={styles.listingTypeLabel}>
              Auction Listing
            </label> */}
            </div>

            <div className={styles.listingForm}>
              <p className={styles.sub}>Product details</p>

              <input
                type="text"
                name="name"
                className={styles.textInput}
                placeholder="Product Name"
              />

              {/* <input
                type="textarea"
                name="description"
                className={styles.descriptionInput}
                placeholder="Product Description"
              /> */}

              <textarea
                name="description"
                className={styles.descriptionInput}
                placeholder="Product Description"
              />

              <input
                type="text"
                name="price"
                className={styles.textInput}
                placeholder="Sale Price"
              />

              <label htmlFor="file-upload" className={styles.uploadFile}>
                <input type="file" onChange={(e) => setFile(
                  // @ts-ignore: Object is possibly 'null'
                  e!.target!.files![0])} />
                <p >Upload image <br /> <AiOutlineUpload /></p>
                <input id="file-upload" type="file" onChange={(e) => setFile(
                  // @ts-ignore: Object is possibly 'null'
                  e?.target?.files[0])} />
              </label>


              <p className={styles.sub}>Package details</p>

              <div className={styles.packageContainer}>
                <input
                  type="number"
                  name="weight"
                  className={styles.textInput}
                  placeholder="Weight(kg)"
                />

                <input
                  type="number"
                  name="height"
                  className={styles.textInput}
                  placeholder="Height(cm)"
                />
              </div>

              <div className={styles.packageContainer}>
                <input
                  type="number"
                  name="width"
                  className={styles.textInput}
                  placeholder="Width(cm)"
                />

                <input
                  type="number"
                  name="depth"
                  className={styles.textInput}
                  placeholder="Depth(cm)"
                />
              </div>
            </div>

            {/* <input id="file-upload" type="file" onChange={(e) => setFile(
              // @ts-ignore: Object is possibly 'null'
              e?.target?.files[0])} /> */}

            <button
              type="submit"
              className={styles.createButton}
              style={{ marginTop: 32, borderStyle: "none" }}
            >
              List Product
            </button>
          </div>
        </div>
      </form>
      {/* <Web3Button
        contractAddress={contractAddress}
        contractAbi={ABI_MARKETPLACE}
        // Call the name of your smart contract function
        action={(contract) => contract.call("createListingRequest", name, description, {
          gasLimit: 3000000,
        })}
      >
        Call Contract Function
      </Web3Button> */}
    </div>
  );
};

export default Create;