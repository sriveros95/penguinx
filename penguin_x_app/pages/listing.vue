<template :class="darker">
  <v-row justify="center" align="center">
    <v-col cols="12" md="11">
      <h1 class="h1">Listing <span class="px_orange">#{{ listing_id }}</span></h1>
      <h2>{{ name }}</h2>
      <v-img v-if="img" :src="img" contain height="333"></v-img>
      <p class="explain">
        {{ description }}
      </p>
      <v-row>
        <v-col cols="12" md="6">
          <button to="/sell" class="mainButton mx-1">{{ $t('main.btn_sell') }}</button>
        </v-col>
        <v-col cols="12" md="6">
          <button to="/buy" class="mainButton mx-1">Shop Cool Stuff</button>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>


<script>
import { CHAIN_ID, PENGUIN_X_VERSION, PENGUIN_X_MARKETPLACE_ADDRESS, PINATA_BEARER } from "../constants"
import { mapState } from "vuex";
import { ethers } from "ethers";
import { ABI_MARKETPLACE } from "~/abis";
const FormData = require('form-data')
const JWT = `Bearer ${PINATA_BEARER}`

var _ = require('lodash');

export default {
  data: () => ({
    listing_id: undefined,
    loading: false,

    img: undefined,
    name: undefined,
    description: undefined,
    metadata: undefined,

    price: undefined,
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
    console.info('montado', this.$route)
    this.listing_id = parseInt(this.$route.query.id)
    this.loadListing()
  },
  methods: {
    async loadListing() {
      if (!this.penguin_x_marketplace) {
        await this.loadContracts();
      }
      console.log('loadListing');

      const resp = await this.penguin_x_marketplace.getListingRequest(this.listing_id);

      if (resp) {
        this.name = resp.name;
        this.description = resp.description
        this.metadata = await this.load_metadata(resp.base_uri);
        this.img =  `https://gateway.ipfscdn.io/ipfs/${this.metadata.image.split('ipfs://')[1]}`;
      }

      console.log('loadListing resp', resp);
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

    async load_metadata(uri){
      console.log('load_metadata metadata', uri);
      // let resp = await this.$axios.get(`https://cloudflare-ipfs.com/ipfs/${uri}`)
      let resp = await this.$axios.get(`https://gateway.ipfscdn.io/ipfs/${uri.split('ipfs://')[1]}`)
      console.log('axios resp', resp);
      return resp.data
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
        const tx = await this.penguin_x_marketplace.createListingRequest(name, description, uri, price);

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
    },

  }
}
</script>