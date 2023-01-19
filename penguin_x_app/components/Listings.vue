<template>
    <v-row>
        <v-col v-for="(listing, x) in listings" cols="12" sm="12" md="4" :key="'listing-' + x">
            Listing {{ listing.id }}
        </v-col>
    </v-row>
</template>

<script>
import { ethers } from "ethers";
import { ABI_MARKETPLACE } from '~/abis';
import { PENGUIN_X_MARKETPLACE_ADDRESS } from '~/constants';

export default {
    data: () => ({
        listings: []
    }),
    methods: {
        async load_listings() {
            console.log('load_listings');
            // A Web3Provider wraps a standard Web3 provider, which is
            // what MetaMask injects as window.ethereum into each page
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            console.log('provider', provider);
            const signer = provider.getSigner();
            this.penguin_x_marketplace = new ethers.Contract(PENGUIN_X_MARKETPLACE_ADDRESS, ABI_MARKETPLACE, signer);
            console.log('penguin_x_marketplace', this.penguin_x_marketplace);
            const total_listings = (await this.penguin_x_marketplace.totalListings()).toNumber();
            console.log('kenum', total_listings, Array(total_listings).keys());
            const resp = Array.from(
                Array(total_listings).keys(),
            ).map(async (i) => {
                console.log('hey', i);
                return i
            });
            console.log('resp', resp);
        }
    },
    mounted() {
        this.load_listings()
    }
}</script>