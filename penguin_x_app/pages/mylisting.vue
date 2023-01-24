<template :class="darker">
  <v-row justify="center" align="center">
    <v-col cols="12" md="11">
      <v-slide-y-transition>
        <div v-if="!d_mode">
          <h1 class="h1">{{ $t('listing.title') }} <span class="px_orange">#{{ listing_id }}</span></h1>
          <h2>{{ name }}</h2>
          <v-img v-if="img" :src="img" contain height="333"></v-img>
          <p class="explain">
            {{ description }}
          </p>
          <h1 v-if="status" class="h1">{{ $t('listing.status.' + status) }}</h1>

          <div v-if="!isOwner" class="owner">
            <h2 class="mid">{{ $t('my_listing.not_owner') }}</h2>
          </div>
          <div v-else-if="listing">
            {{ $t('my_listing.deliver_to') }}
            <p class="sub">country: <span>{{ countryName(country) }}</span></p>
            <p class="sub">name: <span>{{ dd_name }}</span></p>
            <p class="sub">address: <span>{{ dd_address }}</span></p>
            <p class="sub">city: <span>{{ dd_city }}</span></p>
            <p class="sub">state: <span>{{ dd_state }}</span></p>
            <p class="sub">zip: <span>{{ dd_zip }}</span></p>
            <p class="sub">id: <span>{{ dd_gov_id }}</span></p>
            <p class="sub">phone: <span>{{ dd_phone }}</span></p>
            <p class="sub">email: <span>{{ dd_email }}</span></p>
          </div>
        </div>
      </v-slide-y-transition>

      <v-slide-y-transition>
        <div style="display:flex; flexDirection: row, gap: 20, alignItems: center" v-if="d_mode == 'buy'">
          <div>
            <!-- {/* Form Section */} -->
            <div class="collectionContainer">
              <h1 class="sub2">
                Shipping details <br />
              </h1>

              <p class="sub">Country</p>
              <!-- {/* Toggle between direct listing and auction listing */} -->
              <!-- <div class="listingCountryContainer">
                  <input type="radio" name="deliveryZone" id="colombia" value="0" defaultChecked class="listingType" />
                  <label htmlFor="colombia" class="listingCountryLabel">
                    Colombia
                  </label>
                  <input type="radio" name="deliveryZone" id="united_states" value="1" defaultChecked
                    class="listingType" />
                  <label htmlFor="united_states" class="listingCountryLabel">
                    United States
                  </label>
                </div> -->

              <v-select v-model="country" :items="countries" outlined></v-select>

              <!-- {/* <p class="sub">Name</p> */} -->

              <v-text-field outlined v-model="dd_name" type="text" name="deliveryData" class="mb-4"
                :placeholder="$t('forms.buy.name')" />

              <!-- {/* <p class="sub">Address</p> */} -->

              <v-text-field outlined v-model="dd_address" type="text" name="address" class="mb-4"
                :placeholder="$t('forms.buy.address')" />

              <!-- {/* <p class="sub">City</p> */} -->

              <v-text-field outlined v-model="dd_city" type="text" name="city" class="mb-4"
                :placeholder="$t('forms.buy.city')" />

              <div class="packageContainer">
                <v-text-field outlined v-model="dd_state" type="text" name="weight" class="mb-4"
                  :placeholder="$t('forms.buy.state')" />

                <v-text-field outlined v-model="dd_zip" type="number" name="height" class="mb-4"
                  :placeholder="$t('forms.buy.zip')" />
              </div>

              <!-- {/* <p class="sub">Phone Number</p> */} -->
              <v-text-field outlined v-model="dd_gov_id" type="text" name="gov_id" class="mb-4"
                :placeholder="$t('forms.buy.id')" />

              <v-text-field outlined v-model="dd_phone" type="text" name="phone" class="mb-4"
                :placeholder="$t('forms.buy.phone')" />

              <v-text-field outlined v-model="dd_email" type="text" name="email" class="mb-4"
                :placeholder="$t('forms.buy.email')" />


              <button style="borderStyle: none" class="buyButton" @click="d_mode = 'confirm'">
                {{ $t('continue') }}
              </button>
            </div>
          </div>
        </div>
      </v-slide-y-transition>

      <v-slide-y-transition>
        <div style="display:flex; flexDirection: row, gap: 20, alignItems: center" v-if="d_mode == 'confirm'">
          <div>
            <!-- {/* Form Section */} -->
            <div class="collectionContainer">
              <h1 class="sub2">
                {{ listing.buy_confirmation_title }} <br />
              </h1>

              <p class="sub">country: <span>{{ countryName(country) }}</span></p>
              <p class="sub">name: <span>{{ dd_name }}</span></p>
              <p class="sub">address: <span>{{ dd_address }}</span></p>
              <p class="sub">city: <span>{{ dd_city }}</span></p>
              <p class="sub">state: <span>{{ dd_state }}</span></p>
              <p class="sub">zip: <span>{{ dd_zip }}</span></p>
              <p class="sub">id: <span>{{ dd_gov_id }}</span></p>
              <p class="sub">phone: <span>{{ dd_phone }}</span></p>
              <p class="sub">email: <span>{{ dd_email }}</span></p>

              <p>{{ $t('listing.price_w_shipping') }}: {{ price + delivery_price }} USDC</p>

              <button @click="buyNFT" style="borderStyle: none" class="buyButton">
                {{ $t('confirm') }}
              </button>
            </div>
          </div>
        </div>
      </v-slide-y-transition>
      <!-- <v-row>
        <v-col cols="12" md="6">
          <button to="/buy" class="mainButton mx-1"></button>
        </v-col>
      </v-row> -->
    </v-col>
  </v-row>
</template>


<script>
import { CHAIN_ID, PENGUIN_X_VERSION, PENGUIN_X_MARKETPLACE_ADDRESS, PINATA_BEARER, USDC_ADDRESS } from "../constants"
import { mapState } from "vuex";
import { BigNumber, ethers } from "ethers";
import { ABI_MARKETPLACE } from "~/abis";
const { utils } = require("ethers");
const FormData = require('form-data')
const JWT = `Bearer ${PINATA_BEARER}`

var _ = require('lodash');

export default {
  data: () => ({
    d_mode: false,
    listing_id: undefined,
    loading: false,
    status: undefined,

    img: undefined,
    name: undefined,
    description: undefined,
    metadata: undefined,
    listing: undefined,
    price: undefined,
    delivery_price: undefined,
    total_price: undefined,

    penguin_x_marketplace: undefined,
    countries: [
      { "text": "Colombia", value: 1 },
      { "text": "Estados Unidos", value: 2 }
    ],

    country: undefined,
    dd_name: undefined,
    dd_address: undefined,
    dd_city: undefined,
    dd_state: undefined,
    dd_zip: undefined,
    dd_gov_id: undefined,
    dd_phone: undefined,
    dd_email: undefined,

    delivery_data: undefined
  }),
  computed: {
    ...mapState({
      wallet: (state) => state.web3.wallet,
      chainId: (state) => state.web3.chainId
    }),
    networkMismatch() {
      return this.chainId != CHAIN_ID;
    },
    isOwner() {
      if (!this.wallet || !this.listing) { return undefined }
      return this.wallet.toLowerCase() == this.listing.tokenOwner.toLowerCase()
    }
  },
  watch: {
    async country(country) {
      if (country) {
        console.log('country changed', country);
        this.delivery_price = parseFloat(this.$WeiTotokenAmount(await this.$getPenguinXNFTDeliveryPrice(this.listing_id, country), 6));
        this.total_price = this.price + this.delivery_price;
        console.log('delivery_price', this.delivery_price, 'total_price', this.total_price);
        this.$toast.show('🐧 ' + this.$tc('listing.notif.price_is', 1, { country: this.countryName(country), price: this.delivery_price }), { duration: 4200 })
      }
    }
  },
  async mounted() {
    // const ipfs = await IPFS.create()
    // const { cid } = await ipfs.add('Hola multiversxs!')
    console.info('montado', this.$route)
    this.listing_id = parseInt(this.$route.query.id)
    await this.loadListing();


    // this.delivery_price = parseFloat(this.$WeiTotokenAmount(await this.$getPenguinXNFTDeliveryPrice(this.listing_id, 2), 6)); // estimate price to the US
  },
  methods: {
    countryName(id) {
      try {
        return this.countries[id - 1].text
      } catch (error) {
        return ''
      }
    },
    async loadListing() {
      if (!this.penguin_x_marketplace) {
        await this.loadContracts();
      }
      console.log('loadListing');

      const resp = await this.penguin_x_marketplace.listings(this.listing_id);

      if (resp) {
        const { name, description, base_uri, status } = await this.$getPenguinXNFTDets(this.listing_id);
        console.log('got dets', name, description, base_uri, status);
        this.name = name;
        this.description = description;
        this.metadata = await this.load_metadata(base_uri);
        this.status = status;
        this.img = `https://gateway.ipfscdn.io/ipfs/${this.metadata.image.split('ipfs://')[1]}`;
      }

      console.log('loadListing resp', resp);
      this.listing = resp
      this.price = parseFloat(this.$WeiTotokenAmount(resp.reservePricePerToken, 6));

      if (this.isOwner) {
        console.log('its yours');
        const utf8Decode = new TextDecoder()
        const dd = await this.$getDeliveryData(this.listing_id);
        console.log('got dd', dd, dd.name);
        try {
          this.dd_name = utils.toUtf8String(dd.name);
          this.dd_address = utils.toUtf8String(dd.full_address);
          this.dd_city = utils.toUtf8String(dd.city);
          this.dd_zip = utils.toUtf8String(dd.zip);
          this.dd_gov_id = utils.toUtf8String(dd.gov_id);
          this.dd_phone = utils.toUtf8String(dd.phone);
          this.dd_email = utils.toUtf8String(dd.email);
          this.dd_state = utils.toUtf8String(dd.d_state);
        } catch (error) {
          console.error('failed decoding', error);
        }
      }
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

    async load_metadata(uri) {
      console.log('load_metadata metadata', uri);
      // let resp = await this.$axios.get(`https://cloudflare-ipfs.com/ipfs/${uri}`)
      let resp = await this.$axios.get(`https://gateway.ipfscdn.io/ipfs/${uri.split('ipfs://')[1]}`)
      console.log('axios resp', resp);
      return resp.data
    },

    setTestDD() {
      this.dd_name = "sans";
      this.dd_address = "420 Street";
      this.dd_city = "can";
      this.dd_state = "cun";
      this.dd_zip = "123";
      this.dd_gov_id = "govi";
      this.dd_phone = "777";
      this.dd_email = "sa@nti.ago";
      this.country = 1;
    },

    async buyNFT() {
      try {
        this.loading = true

        // the function can be called as follows:
        console.log('calling buyNFT price is', this.total_price);
        let price = this.$tokenAmountToWei(this.total_price.toString(), 6);
        console.log('price elevated', price, price.toString());
        this.$toast.show('🐧 ' + this.$tc('listing.notif.usdc_approve', 1, { price: this.total_price }), { duration: 4200 });

        await this.$approvePenguinXUSDC(price);

        this.$toast.show('🐧 ' + this.$tc('listing.notif.usdc_approved'), { duration: 4200 });

        const utf8Encode = new TextEncoder()
        await this.$buyPenguinXNFT(
          this.listing_id,
          price,
          this.wallet,
          1,
          {
            zone: this.country,
            name: utf8Encode.encode(this.dd_name),
            full_address: utf8Encode.encode(this.dd_address),
            zip: utf8Encode.encode(this.dd_zip),
            city: utf8Encode.encode(this.dd_city),
            gov_id: utf8Encode.encode(this.dd_gov_id),
            email: utf8Encode.encode(this.dd_email),
            phone: utf8Encode.encode(this.dd_phone),
            tracking_code: [],
            delivery_proof: [],
          }
        );

        this.$toast.show('🐧 ' + this.$tc('listing.notif.buy_success'), { duration: 4200 });

        return true;
      } catch (error) {
        console.error('failed req', error);
      }
    },

  }
}
</script>