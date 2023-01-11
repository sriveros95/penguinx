import {
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useListing,
  useContract,
  useAddress,
  useContractWrite,
  useContractRead,
  useSDK,
} from "@thirdweb-dev/react";
import * as IPFS from 'ipfs-core'
import {
  ChainId,
  ListingType,
  NATIVE_TOKENS,
} from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
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
  const [listingData, setListingData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>([]);
  const [penguinXNFT, setPenguinXNFT] = useState<any>();

  const { contract: penguin_marketplace } = useContract(
    PENGUIN_X_MARKETPLACE_ADDRESS, // Your marketplace contract address here
    ABI_MARKETPLACE,
  );
  const { mutate: addTrackingCode, isLoading: addingTrackingCode } = useContractWrite(
    penguin_marketplace,
    "addTrackingCode", // The name of the function on your contract
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

  function handleAddTrackingCode(e: any) {
    e.preventDefault();
    const { trackingCode } = e.target.elements;
    console.log('handleAddTrackingCode', trackingCode.value, listingData);
    const params = [listingData!['id'], ethers.utils.formatBytes32String(trackingCode.value)]
    console.log('addTrackingCode', params);
    addTrackingCode(params);
  }

  const sdk = useSDK()
  console.log('sdk', sdk);

  console.log('loading delivery for', address);


  if (!penguinXNFT && sdk) {
    setPenguinXNFT(new ethers.Contract(listingId, ABI_NFT, sdk?.getSigner()));
    console.log('penguinXNFT set', penguinXNFT);
  }

  if (penguinXNFT && !listingData && !loading) {
    setLoading(true);
    penguinXNFT.ownerOf(0).then(async (resp_owner: any) => {
      const uri = await penguinXNFT.tokenURI(0);
      console.log('uri is', uri);

      let resp = await fetch(`https://cloudflare-ipfs.com/ipfs/${uri.split('ipfs://')[1]}`)
      resp = await resp.json();
      console.log('metadata', resp);
      setMetadata(resp);

      console.log('ownerOf', resp_owner, resp_owner == address);
      if (resp_owner == address) {
        console.log('you own it');
        penguinXNFT.getDeliveryData().then(async (dd: any) => {
          console.log('delivery data', dd);
          try {dd = ethers.utils.parseBytes32String(dd);} catch (error) {}
          let tk: any = false;
          if (dd != '0x') {
            try {
              tk = await penguinXNFT.getTrackingCode()
              console.log('got tk', tk);
              if (tk && tk != '0x') {
                try {tk = ethers.utils.parseBytes32String(tk);} catch (error) {}
              }
            } catch (error) {
              console.error('failed getting tk', error);
            }
          }
          let listing = {
            'id': await penguinXNFT.listing_id(),
            'name': await penguinXNFT.name(),
            'description': await penguinXNFT.description(),
            'delivery': dd,
            'tracking': tk,
            'verifier': await penguinXNFT.getVerifier()
          }
          setListingData(listing);
          setLoading(false);
        })
      } else {
        setListingData("NOT_MINE");
        setLoading(false);
      }
    });
  }


  const { contract: usdc } = useContract(
    USDC_ADDRESS,
    ABI_ERC20
  );
  console.log('usdc contract', usdc);

  // Store the bid amount the user entered into the bidding textbox
  const [bidAmount, setBidAmount] = useState<string>("");

  if (loading) {
    return <div className={styles.loadingOrError}>Loading...</div>;
  }

  if (!listingData) {
    return <div className={styles.loadingOrError}>Listing not found</div>;
  }

  if (listingData == "NOT_MINE") {
    return <div className={styles.loadingOrError}>Listing doesn't belong to you</div>;
  }

  // return <div className={styles.loadingOrError}>Yours papi</div>;

  const verification_status = listingData['verifier'] == '0x0000000000000000000000000000000000000000' ?
    <p>No ha sido verificado aún</p> : <p>Verificado por: {listingData['verifier']}</p>;

  const delivery_data = listingData['delivery'] == '0x' ?
    <p>No hay datos de envío aún</p> : <div>
      <p>Enviar a: {listingData['delivery']}</p>
    </div>;

  const tracking_code = listingData['tracking'] && listingData['tracking'] != '0x' ?
    <p>Tracking Code: {listingData['tracking']}</p> : <div>
      <form onSubmit={(e) => handleAddTrackingCode(e)}>
        {/* Form Section */}
        <div className={styles.collectionContainer}>
          <h1 className={styles.ourCollection}>
            Datos de envío
          </h1>

          <div className={styles.listingForm}>
            <p className={styles.sub}>Tracking Code</p>

            {/* NFT Contract Address Field */}
            <input
              type="text"
              name="trackingCode"
              className={styles.textInput}
              placeholder="Código de seguimiento"
            />

            <button
              type="submit"
              className={styles.mainButton}
              style={{ margin: 32, borderStyle: "none", width: "100%" }}
            >
              Agregar código de envío
            </button>

          </div>
        </div>
      </form>
    </div>;


  let nft_image = metadata ? <MediaRenderer
    src={metadata.image}
    className={styles.mainNftImage}
  /> : <p>Loading metadata...</p>

  return (
    <div className={styles.container} style={{}}>
      <div className={styles.listingContainer}>
        <div className={styles.leftListing}>
          {nft_image}
        </div>

        <div className={styles.rightListing}>
          <h1 className={styles.h1}>{listingData['name']}</h1>


          {verification_status}

          {delivery_data}

          {tracking_code}

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
