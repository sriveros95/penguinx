<template>
    <v-row class="left">
        <!-- <p v-if="!wallet" class="description mx-3">{{ $t('dapp.log_in') }}</p>
        <template v-else> -->
        <v-col cols="12">
            <v-pagination v-if="total_listings & !wallet" v-model="page" :length="total_pages" :total-visible="7" circle></v-pagination>
        </v-col>
        <v-progress-circular v-if="loading" class="my-4 mx-auto" :size="77" :width="7" color="#f78c42"
            indeterminate></v-progress-circular>
        <template v-else>
            <v-col v-for="(listing, x) in listings" cols="12" xs="12" sm="6" md="4" :key="'listing-' + x"
                class="marginBottom">
                <!-- Listing {{ listing.id }} -->

                <Listing :listing="listing" :load_dets="load_dets" :link_to="link_to"></Listing>
            </v-col>
        </template>
        <v-col cols="12" class="marginBottom">
            <v-pagination v-if="total_listings & !wallet" v-model="page" :length="total_pages" :total-visible="7" circle></v-pagination>
        </v-col>
        <!-- </template> -->
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
        filter: { type: String | undefined, default: undefined }
    },
    data: () => ({
        listings: [],
        loading: true,
        page: 1,
        total_listings: undefined,
        page_randomizer: undefined
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
        },
        total_pages() {
            if (!this.total_listings) {return undefined}
            const pages = Math.ceil(this.total_listings / 6)
            const r_arr = []
            for (let index = 0; index < pages; index++) {r_arr.push(index)}
            this.page_randomizer = r_arr.sort(() => (Math.random() > .5) ? 1 : -1);
            console.log('page_randomizer', this.page_randomizer);
            return pages
        }
    },
    methods: {
        async load_listings(page = 0) {
            this.loading = true
            if (!this.page_randomizer) {return}
            page = this.page_randomizer[page]
            console.log("load_listings", page, this.wallet);
            // A Web3Provider wraps a standard Web3 provider, which is
            // what MetaMask injects as window.ethereum into each page
            if (this.wallet) {
                if (this.filter == 'sold_by_user') {
                    this.listings = await this.$getListingsSoldBy(this.wallet);
                } else if (this.filter == 'bought_by_user') {
                    this.listings = await this.$getListingsBoughtBy(this.wallet);
                } else {
                    this.listings = await this.$getAllListingsNoFilter();
                }
                console.log("got", this.listings);
            } else {
                if (['sold_by_user', 'bought_by_user'].includes(this.filter)) { return false }
                this.listings = await this.$getListingsPub(page);
            }
            this.loading = false
        }
    },
    watch: {
        wallet(wallet) {
            console.log("wallet change");
            this.load_listings(page - 1);
        },
        page(page) {
            console.log("page change");
            this.load_listings(page - 1);
        },
        page_randomizer(page_randomizer) {
            console.log("page_randomizer changed", page_randomizer);
            this.load_listings(this.page - 1);
        }
    },
    async mounted() {
        this.total_listings = await this.$getTotalListingsPub()
        console.log('total_listings:', this.total_listings);
    }
    ,
    components: { Listing }
}</script>