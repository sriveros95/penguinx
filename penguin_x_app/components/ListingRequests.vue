<template>
    <v-row>
        <v-col v-for="(listing, x) in listings" cols="12" sm="12" md="4" :key="'listing-' + x">
            Listing Request {{ listing.id }}

            <ListingRequest :listing="listing"></ListingRequest>
        </v-col>
    </v-row>
</template>

<script>
import { ethers } from "ethers";
import { mapState } from "vuex";
import { ABI_MARKETPLACE } from '~/abis';
import { PENGUIN_X_MARKETPLACE_ADDRESS } from '~/constants';
import ListingRequest from "./ListingRequest.vue";

export default {
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
    },
    methods: {
        async load_listings() {
            console.log("load_listings", this.wallet);
            // A Web3Provider wraps a standard Web3 provider, which is
            // what MetaMask injects as window.ethereum into each page
            if (this.wallet) {
                this.listings = await this.$getMyListingRequests(this.wallet);
                console.log("got", this.listings);
            }
        }
    },
    watch: {
        wallet(wallet) {
            console.log("wallet change");
            this.load_listings();
        }
    }
    // mounted() {
    //     this.load_listings()
    // }
    ,
    components: { ListingRequest }
}</script>