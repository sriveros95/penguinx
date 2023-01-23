<template>
    <v-card :to="`listing?id=${listing.id}`" class="listingShortView">
        <v-card-title class="center-text">
            {{  listing.name  }}
            <v-spacer></v-spacer>
            <v-chip v-if="status">{{ $t('listing.status.' + status) }}</v-chip>
            <v-chip v-else-if="listing.quantity == 0">{{ $t('sold') }}</v-chip>
        </v-card-title>
        <v-card-subtitle class="sub">${{  $WeiTotokenAmount(listing.reservePricePerToken, 6)  }} USDC</v-card-subtitle>
        <IPFSImg v-if="listing.image" :metadata_src="listing.image"></IPFSImg>
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
        listing: Object,
        link_to: {type: String, default: 'listing'},
        load_dets: {type: Boolean, default: false}
    },
    data: () => ({
        status: undefined
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
    async mounted(){
        if (this.load_dets) {
            const { status } = await this.$getPenguinXNFTDets(this.listing.id);
            this.status = status;
        }
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