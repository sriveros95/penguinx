<template>
    <v-card>
        <v-card-title>{{  listing.name  }}</v-card-title>
        <v-card-subtitle class="font-weight-bold">${{  $WeiTotokenAmount(listing.price, 6)  }} USDC</v-card-subtitle>
        <IPFSImg v-if="listing.base_uri" :metadata_src="listing.base_uri"></IPFSImg>
        <!-- <pre>
            {{ listing }}
        </pre> -->
    </v-card>
</template>

<script>
import { ethers } from "ethers";
import { mapState } from "vuex";
import { ABI_MARKETPLACE } from '~/abis';
import { PENGUIN_X_MARKETPLACE_ADDRESS } from '~/constants';
import IPFSImg from "./IPFSImg.vue";

export default {
    props: {
        listing: Object
    },
    computed: {
        // ...mapGetters("web3", ["getInstance"]),
        // web3() {
        //   return this.getInstance;
        // },
        ...mapState({
            wallet: (state) => state.web3.wallet
        }),
    },
    methods: {},
    watch: {
    // wallet(wallet) {
    //     console.log('wallet change');
    //     this.load_listings()
    // }
    }
    // mounted() {
    //     this.load_listings()
    // }
    ,
    components: { IPFSImg }
}</script>