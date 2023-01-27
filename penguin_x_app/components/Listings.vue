<template>
    <v-row class="left">
        <p v-if="!wallet" class="description mx-3">{{ $t('dapp.log_in') }}</p>
        <template v-else>
            <v-col v-for="(listing, x) in listings" cols="12" xs="12" sm="6" md="4" :key="'listing-' + x" class="marginBottom">
                <!-- Listing {{ listing.id }} -->

                <Listing :listing="listing" :load_dets="load_dets" :link_to="link_to"></Listing>
            </v-col>
        </template>
    </v-row>
</template>

<script>
import { ethers } from "ethers";
import { mapState } from "vuex";
import { ABI_MARKETPLACE } from '~/abis';
import { PENGUIN_X_MARKETPLACE_ADDRESS } from '~/constants';
import Listing from "./Listing.vue";

export default {
    props: {
        filter: {type: String|undefined, default: undefined}
    },
    data: () => ({
        listings: []
    }),
    computed: {
        // ...mapGetters("web3", ["getInstance"]),
        // web3() {
        //   return this.getInstance;
        // },
        ...mapState({
            wallet: (state) => state.web3.wallet
        }),
        load_dets() {
            return this.filter == 'sold_by_user'
        },
        link_to() {
            switch (this.filter) {
                case 'bought_by_user':
                    return 'listing'
                case 'sold_by_user':
                    return 'mylisting'
                default:
                    return 'listing'
            }
        }
    },
    methods: {
        async load_listings() {
            console.log("load_listings", this.wallet);
            // A Web3Provider wraps a standard Web3 provider, which is
            // what MetaMask injects as window.ethereum into each page
            if (this.wallet) {
                if (this.filter == 'sold_by_user') {
                    this.listings = await this.$getListingsSoldBy(this.wallet);
                }else if (this.filter == 'bought_by_user') {
                    this.listings = await this.$getListingsBoughtBy(this.wallet);
                }else{
                    this.listings = await this.$getAllListingsNoFilter();
                }
                console.log("got", this.listings);
            }
        }
    },
    watch: {
        wallet(wallet) {
            console.log("wallet change");
            this.load_listings();
        }
    },
    mounted() {
        this.load_listings()
    }
    ,
    components: { Listing }
}</script>