<template :class="darker">
  <v-row justify="center" align="center">

    <v-slide-y-transition>
      <v-row v-if="!wallet">
        <v-col cols="12" xs="12" md="6" class="mt-12">
          <p class="description mx-3">{{ $t('dapp.log_in') }}</p>
        </v-col>
      </v-row>
    </v-slide-y-transition>

    <template v-if="wallet">
      <v-slide-y-transition>
        <v-row v-if="!d_mode">
          <v-col cols="12" xs="12" md="6">
            <!-- <h1 class="h1">{{ $t('listing.title') }} <span class="px_orange">#{{ listing_id }}</span></h1>
            <h2>{{ name }}</h2> -->
            <v-img v-if="img" :src="img" contain height="500" class="mainNftImage"></v-img>
            <!-- <p class="explain">
              {{ description }}
            </p> -->
          </v-col>

          <v-col cols="12" xs="12" md="6">
            <div class="d-flex flex-column listingDetailsContainer">
              <h1 class="productTitle">{{ name }}</h1>

              <p class="owner" v-if="listing">
                <span class="mid">Owner</span> {{
                  listing.tokenOwner?.slice(0, 6) +
                    "..." +
                    listing.tokenOwner?.slice(36, 40)
                }}
              </p>

              <p class="sub2">{{ $t('listing.details') }}</p>

              <p class="description">{{ description }}</p>

              <p class="sub2">Price</p>

              <h2 class="price" v-if="listing">
                {{ price }}
                USDC <span class="sub">+ shipping</span>
              </h2>
              <p v-if="delivery_price" class="shipping">Est. shipping: {{ delivery_price }} USDC</p>

              <button v-if="status == 10" style="borderStyle: none" class="buyButton" @click="d_mode = 'buy'">
                {{ $t('listing.buy') }}
              </button>
              <button
                v-else-if="(status == 30 || status == 31) && listing.tokenBuyer.toLowerCase() == wallet.toLowerCase()"
                style="borderStyle: none" class="buyButton" @click="d_mode = 'view_dd'; loadDD()">
                See Delivery Information
              </button>
            </div>
          </v-col>
        </v-row>
      </v-slide-y-transition>

      <v-slide-y-transition>
        <div style="display:flex; flexDirection: row, gap: 20, alignItems: center" v-if="d_mode == 'buy'">
          <div>
            <!-- {/* Form Section */} -->
            <div class="collectionContainer listingDetailsContainer">
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

              <v-text-field outlined v-model="dd_name" type="text" name="deliveryData" class="mb-3"
                :placeholder="$t('forms.buy.name')" />

              <!-- {/* <p class="sub">Address</p> */} -->

              <v-text-field outlined v-model="dd_address" type="text" name="address" class="mb-3"
                :placeholder="$t('forms.buy.address')" />

              <!-- {/* <p class="sub">City</p> */} -->

              <v-text-field outlined v-model="dd_city" type="text" name="city" class="mb-3"
                :placeholder="$t('forms.buy.city')" />

              <div class="packageContainer">
                <v-text-field outlined v-model="dd_state" type="text" name="weight" class="mb-3"
                  :placeholder="$t('forms.buy.state')" />

                <v-text-field outlined v-model="dd_zip" type="number" name="height" class="mb-3"
                  :placeholder="$t('forms.buy.zip')" />
              </div>

              <!-- {/* <p class="sub">Phone Number</p> */} -->
              <v-text-field outlined v-model="dd_gov_id" type="text" name="gov_id" class="mb-3"
                :placeholder="$t('forms.buy.id')" />

              <v-text-field outlined v-model="dd_phone" type="text" name="phone" class="mb-3"
                :placeholder="$t('forms.buy.phone')" />

              <v-text-field outlined v-model="dd_email" type="text" name="email" class="mb-3"
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
            <div class="collectionContainer listingDetailsContainer">
              <h1 class="sub2">
                {{ listing.buy_confirmation_title }} <br />
              </h1>

              <p class="subInline">country: <span class="description">{{ countryName(country) }}</span></p>
              <p class="subInline">name: <span class="description">{{ dd_name }}</span></p>
              <p class="subInline">address: <span class="description">{{ dd_address }}</span></p>
              <p class="subInline">city: <span class="description">{{ dd_city }}</span></p>
              <p class="subInline">state: <span class="description">{{ dd_state }}</span></p>
              <p class="subInline">zip: <span class="description">{{ dd_zip }}</span></p>
              <p class="subInline">id: <span class="description">{{ dd_gov_id }}</span></p>
              <p class="subInline">phone: <span class="description">{{ dd_phone }}</span></p>
              <p class="subInline">email: <span class="description">{{ dd_email }}</span></p>

              <p>{{ $t('listing.price_w_shipping') }}: {{ price + delivery_price }} USDC</p>

              <button v-if="!last_mode_status" @click="buyNFT" style="borderStyle: none" class="buyButton">
                {{ $t('confirm') }}
              </button>
              <p v-else>{{ last_mode_status }}</p>
            </div>
          </div>
        </div>
      </v-slide-y-transition>

      <v-slide-y-transition>
        <v-row v-if="d_mode == 'view_dd'" justify="center">
          <v-col cols="12" md="6" class="marginTop">
            <v-progress-circular v-if="loading" class="my-4 mx-auto" :size="77" :width="7" color="primary"
              indeterminate></v-progress-circular>

            <p class="sub2">{{ $t('listing.tracking_code_title') }}</p>
            <p class="sub">{{ $t('listing.tracking_code_sub') }}: <span class="description">{{
              dd_tracking_code
            }}</span>
            </p>
            <v-img v-if="dd_delivery_proof" :src="proof_img" contain height="333" class="mainNftImage left"></v-img>
          </v-col>
          <v-col cols="12" md="6" class="marginTop">
            <p class="sub2">Shipping details</p>
            <p class="subInline">country: <span class="description">{{ countryName(country) }}</span></p>
            <p class="subInline">name: <span class="description">{{ dd_name }}</span></p>
            <p class="subInline">address: <span class="description">{{ dd_address }}</span></p>
            <p class="subInline">city: <span class="description">{{ dd_city }}</span></p>
            <p class="subInline">state: <span class="description">{{ dd_state }}</span></p>
            <p class="subInline">zip: <span class="description">{{ dd_zip }}</span></p>
            <p class="subInline">id: <span class="description">{{ dd_gov_id }}</span></p>
            <p class="subInline">phone: <span class="description">{{ dd_phone }}</span></p>
            <p class="subInline">email: <span class="description">{{ dd_email }}</span></p>
          </v-col>
        </v-row>
      </v-slide-y-transition>

    </template>
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

    img: undefined,
    name: undefined,
    description: undefined,
    metadata: undefined,
    listing: undefined,
    price: undefined,
    delivery_price: undefined,
    total_price: undefined,
    status: undefined,

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
    dd_tracking_code: undefined,
    dd_delivery_proof: undefined,

    last_mode_status: undefined,
    transaction_hash: undefined
  }),
  computed: {
    ...mapState({
      wallet: (state) => state.web3.wallet,
      chainId: (state) => state.web3.chainId
    }),
    networkMismatch() {
      return this.chainId != CHAIN_ID;
    },
    proof_img() {
      if (!this.dd_delivery_proof) return '';
      return `https://gateway.ipfscdn.io/ipfs/${this.dd_delivery_proof.split('ipfs://')[1]}`;
    }
  },
  watch: {
    async country(country) {
      if (country) {
        console.log('country changed', country);
        this.delivery_price = parseFloat(this.$WeiTotokenAmount(await this.$getPenguinXNFTDeliveryPrice(this.listing_id, country), 6));
        this.total_price = this.price + this.delivery_price;
        console.log('delivery_price', this.delivery_price, 'total_price', this.total_price);
        this.$toast.show('???? ' + this.$tc('listing.notif.price_is', 1, { country: this.countryName(country), price: this.delivery_price }), { duration: 4200 })
      }
    },
    async wallet() {
      this.loadListing()
      this.delivery_price = parseFloat(this.$WeiTotokenAmount(await this.$getPenguinXNFTDeliveryPrice(this.listing_id, 2), 6)); // estimate price to the US
    }
  },
  async mounted() {
    console.info('montado', this.$route)
    this.listing_id = parseInt(this.$route.query.id)
    if (this.wallet) {
      await this.loadListing();
      this.delivery_price = parseFloat(this.$WeiTotokenAmount(await this.$getPenguinXNFTDeliveryPrice(this.listing_id, 2), 6)); // estimate price to the US
    }
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
      if (!this.wallet) { return }
      if (!this.penguin_x_marketplace) {
        await this.loadContracts();
      }
      console.log('loadListing');

      const resp = await this.penguin_x_marketplace.listings(this.listing_id);

      if (resp) {
        const { name, description, base_uri, status } = await this.$getPenguinXNFTDets(this.listing_id);
        console.log('got dets', name, description, base_uri);
        this.name = name;
        this.description = description;
        this.metadata = await this.load_metadata(base_uri);
        this.status = status;
        this.img = `https://gateway.ipfscdn.io/ipfs/${this.metadata.image.split('ipfs://')[1]}`;
      }

      console.log('loadListing resp', resp);
      this.listing = resp
      this.price = parseFloat(this.$WeiTotokenAmount(resp.reservePricePerToken, 6));
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

    // setTestDD() {
    //   this.dd_name = "sans";
    //   this.dd_address = "420 Street";
    //   this.dd_city = "can";
    //   this.dd_state = "cun";
    //   this.dd_zip = "123";
    //   this.dd_gov_id = "govi";
    //   this.dd_phone = "777";
    //   this.dd_email = "sa@nti.ago";
    //   this.country = 1;
    // },

    async buyNFT() {
      try {
        this.loading = true

        // the function can be called as follows:
        console.log('calling buyNFT price is', this.total_price);
        let price = this.$tokenAmountToWei(this.total_price.toString(), 6);
        console.log('price elevated', price, price.toString());
        this.last_mode_status = '???? ' + this.$tc('listing.notif.usdc_approve', 1, { price: this.total_price })
        this.$toast.show('???? ' + this.$tc('listing.notif.usdc_approve', 1, { price: this.total_price }), { duration: 4200 });

        await this.$approvePenguinXUSDC(price);

        this.$toast.show('???? ' + this.$tc('listing.notif.usdc_approved'), { duration: 4200 });
        this.last_mode_status = '???? ' + this.$tc('listing.notif.usdc_approved')

        const utf8Encode = new TextEncoder()
        const buy_resp = await this.$buyPenguinXNFT(
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
            d_state: utf8Encode.encode(this.dd_state),
            gov_id: utf8Encode.encode(this.dd_gov_id),
            email: utf8Encode.encode(this.dd_email),
            phone: utf8Encode.encode(this.dd_phone),
            tracking_code: [],
            delivery_proof: [],
          }
        );

        this.$toast.show('???? ' + this.$tc('listing.notif.buy_success'), { duration: 4200 });

        console.log('buy_resp', buy_resp);

        // this.transaction_hash = 
        // https://polygonscan.com/tx/0x596d775ad5ca8467a398fccea61c0906bda107e25b6df32cd9c19f096280144e

        return true;
      } catch (error) {
        console.error('failed req', error);
      }
    },

    async loadDD() {
      const dd = await this.$getDeliveryData(this.listing_id);
      console.log('got dd', dd, dd.name);
      try {
        this.country = dd.zone
        this.dd_name = utils.toUtf8String(dd.name);
        this.dd_address = utils.toUtf8String(dd.full_address);
        this.dd_city = utils.toUtf8String(dd.city);
        this.dd_zip = utils.toUtf8String(dd.zip);
        this.dd_gov_id = utils.toUtf8String(dd.gov_id);
        this.dd_phone = utils.toUtf8String(dd.phone);
        this.dd_email = utils.toUtf8String(dd.email);
        this.dd_state = utils.toUtf8String(dd.d_state);
        this.dd_tracking_code = utils.toUtf8String(dd.tracking_code);
        this.dd_delivery_proof = utils.toUtf8String(dd.delivery_proof);
      } catch (error) {
        console.error('failed decoding', error);
      }
    }

  }
}
</script>