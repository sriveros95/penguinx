<template>
  <v-row>
    <v-col class="text-center">
      <div class="marginTop">
        <form @submit="handleCreateListing">
          <div>
            <!-- {/* Form Section */} -->
            <div>
              <h1 class="ourCollection">
                Create a new listing
              </h1>

              <!-- {/* Toggle between direct listing and auction listing */} -->
              <!-- <div class="listingTypeContainer">
                <input type="radio" name="listingType" id="directListing" value="directListing" defaultChecked
                  class="listingType" />
                <label htmlFor="directListing" class="listingTypeLabel">
                  Direct Listing
                </label> -->
              <!-- {/* <input type="radio" name="listingType" id="auctionListing" value="auctionListing"
                  class="listingType} />
                <label htmlFor="auctionListing" class="listingTypeLabel">
                  Auction Listing
                </label> */} -->
              <!-- </div> -->

              <div class="listingForm">
                <p class="sub">Product details</p>

                <v-text-field type="text" name="name" class="textInput mb-7" placeholder="Product Name" v-model="name"
                  outlined />


                <!-- {/* <input type="textarea" name="description" class="descriptionInput"
                  placeholder="Product Description" /> */} -->

                <v-textarea name="description" class="descriptionInput mb-6" placeholder="Product Description" rows="4"
                  v-model="description" outlined hide-details />

                <v-text-field name="price" class="textInput mb-3" placeholder="Sale Price" v-model="price" outlined />

                <label htmlFor="file-upload" class="uploadFile">
                  <input name="file-upload" id="file-upload" type="file" @change="handleFileChange" />
                  <p>Upload image <br />
                    <v-icon>mdi-upload</v-icon>
                  </p>
                </label>


                <p class="sub">Package details</p>

                <v-row>
                  <v-col cols="12" sm="6" class="px-1">
                    <v-text-field type="number" name="weight" class="mb-1" placeholder="Weight(kg)" v-model="weight"
                      outlined />
                    <v-text-field type="number" name="height" class="" placeholder="Height(cm)" v-model="height"
                      outlined />
                  </v-col>
                  <v-col cols="12" sm="6" class="px-1">
                    <v-text-field type="number" name="width" class=" mb-1" placeholder="Width(cm)" v-model="width"
                      outlined />
                    <v-text-field type="number" name="depth" class="" placeholder="Depth(cm)" v-model="depth"
                      outlined />
                  </v-col>
                </v-row>
              </div>

              <!-- {/* <input id="file-upload" type="file" onChange={(e)=> setFile(
              // @ts-ignore: Object is possibly 'null'
              e?.target?.files[0])} /> */} -->

              <button v-if="!loading" type="submit" class="createButton mt-7 mb-15">
                List Product
              </button>
              <div v-else class="text-center">
                <v-progress-circular class="my-4 mx-auto" :size="77" :width="7" color="primary"
                  indeterminate></v-progress-circular>
              </div>
            </div>
          </div>
        </form>
        <!-- {/* <Web3Button contractAddress={contractAddress} contractAbi={ABI_MARKETPLACE} // Call the name of your smart
          contract function action={(contract)=> contract.call("createListingRequest", name, description, {
          gasLimit: 3000000,
          })}
          >
          Call Contract Function
        </Web3Button> */} -->
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { CHAIN_ID, PENGUIN_X_VERSION, PENGUIN_X_MARKETPLACE_ADDRESS } from "../constants"
import { mapState } from "vuex";
import { ethers } from "ethers";
import { ABI_MARKETPLACE } from "~/abis";
const FormData = require('form-data')

var _ = require('lodash');

export default {
  data: () => ({
    loading: false,

    file: undefined,
    name: undefined,
    description: undefined,
    price: undefined,
    name: undefined,
    weight: undefined,
    height: undefined,
    width: undefined,
    depth: undefined,

    penguin_x_marketplace: undefined
  }),
  computed: {
    // ...mapGetters("web3", ["getInstance"]),
    // web3() {
    //   return this.getInstance;
    // },
    ...mapState({
      chainId: (state) => state.web3.chainId
    }),
    networkMismatch() {
      return this.chainId != CHAIN_ID;
    }
  },
  async mounted() {
    // const ipfs = await IPFS.create()
    // const { cid } = await ipfs.add('Hola multiversxs!')
    console.info('montado')
  },
  methods: {
    handleFileChange(e) {
      e.preventDefault();
      console.log('handleFileChange', e);
      this.file = e.target.files[0]
    },
    async loadContracts() {
      console.log('loadContracts');

      // A Web3Provider wraps a standard Web3 provider, which is
      // what MetaMask injects as window.ethereum into each page
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      console.log('provider', provider);
      const signer = provider.getSigner();
      this.penguin_x_marketplace = new ethers.Contract(PENGUIN_X_MARKETPLACE_ADDRESS, ABI_MARKETPLACE, signer);
      console.log('penguin_x_marketplace', this.penguin_x_marketplace);
    },
    async switchNetwork(_chainId) {
      console.log('switching to', _chainId);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${_chainId.toString(16)}` }],    // chainId must be in HEX with 0x in front
      });
    },
    async handleCreateListing(e) {
      // Prevent page from refreshing
      e.preventDefault();
      this.loading = true;
      console.log('handleCreateListing', e);

      try {
        // Ensure user is on the correct network
        if (this.networkMismatch) {
          this.switchNetwork(CHAIN_ID);
        }

        // De-construct data from form submission
        const { name, description, listingType, price, weight, height, width, depth } = e.target.elements;
        console.log('name & desc:', name, description);

        // Upload image
        console.log('uploadToIpfs started', e.target.elements);

        const uploadUri = await this.$pinFileToIPFS(this.file);
        // const uploadUri = "TEST_REPLACEME";

        console.log('uploaded to ipfs image', uploadUri);

        // Upload metadata to ipfs before deploying nft
        const metadata = {
          name: name.value,
          description: description.value,
          // Here we add a file into the image property of our metadata
          image: uploadUri,  // Upload image to ipfs first 
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
        const uri = await this.$pinJSONToIPFS(metadata);
        console.log('metadata uploaded', uri);

        // Store the result of either the direct listing creation or the auction listing creation
        // : undefined | TransactionResult = undefined;

        // Depending on the type of listing selected, call the appropriate function
        // For Direct Listings:
        // if (listingType.value === "directListing") {
        let transactionResult = await this.createDirectListing(
          name.value,
          description.value,
          uri,
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
          this.$router.push('/prelisting?id=' + transactionResult.toNumber())
        } else {
          console.log('no transactionResult');

        }
      } catch (error) {
        console.error(error);
        this.loading = false;
        this.$toast.error('💩 ' + this.$t('errors.occurred'), { duration: 4200 })
      }
    },
    async createDirectListing(
      name,
      description,
      uri,
      price
    ) {
      try {
        // the function can be called as follows:
        console.log('calling createListingRequest price is', price);
        price = this.$tokenAmountToWei(price, 6);
        console.log('price elevated', price, price.toString());

        if (!this.penguin_x_marketplace) {
          await this.loadContracts();
        }
        this.$toast.show('🐧 ' + this.$t('sign_transaction'), { duration: 4200 })
        const tx = await this.penguin_x_marketplace.createListingRequest(name, description, uri, price);
        this.$toast.show('🐧 ' + this.$t('processing'), { duration: 4200 })
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
  }
}
</script>