import Vue from "vue";
import axios from 'axios';

import { ethers } from "ethers";
const { BigNumber } = require('ethers');
import { ABI_MARKETPLACE, ABI_NFT } from "~/abis";
import { PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_NFT_ADDRESS } from "~/constants";

Vue.prototype.$tokenAmountToWei = (amount, decimals) => {
    return BigNumber.from("0x" + (amount * 10 ** decimals).toString(16)).toString();
}

Vue.prototype.$WeiTotokenAmount = (wei, decimals) => {
    return ethers.utils.formatUnits(wei, decimals);
}

let _provider;
let _signer;
let _penguin_x_marketplace;
let _penguin_x_nft;

async function loadContracts() {
    console.log('penguinx: loadContracts');
    try {
        _provider = new ethers.providers.Web3Provider(window.ethereum);
        _signer = _provider.getSigner();
        _penguin_x_marketplace = new ethers.Contract(PENGUIN_X_MARKETPLACE_ADDRESS, ABI_MARKETPLACE, _signer);
        _penguin_x_nft = new ethers.Contract(PENGUIN_X_NFT_ADDRESS, ABI_NFT, _signer);
    } catch (error) {
        console.log('failed to get provider');
    }
    console.log('penguinx: contracts loaded');
}


Vue.prototype.$loadMetadata = async (uri) => {
    console.log('load_metadata metadata', uri);
    // let resp = await this.$axios.get(`https://cloudflare-ipfs.com/ipfs/${uri}`)
    uri = uri.split('ipfs://')[1]
    if (!uri) { return false }
    let resp = await axios.get(`https://gateway.ipfscdn.io/ipfs/${uri}`)
    console.log('axios resp', resp);
    return resp.data
}

Vue.prototype.$getAllListingRequestsNoFilter = async () => {
    console.log('penguinx: getAllListingRequestsNoFilter');
    if (!_penguin_x_marketplace) {
        await loadContracts();
    }
    console.log('getting listing requests');
    const listings = await Promise.all(
        Array.from(
            Array(
                (await _penguin_x_marketplace.totalListingRequests()).toNumber(),
            ).keys(),
        ).map(async (i) => {
            let listing;
            try {
                listing = await _penguin_x_marketplace.listing_requests(i);
                console.log(listing);
                listing = {
                    ...listing, ...{
                        'id': i,
                    }
                }
                console.log(listing);
            } catch (err) {
                console.error(err);
                console.warn(
                    `Failed to get listing ${i}' - skipping. Try 'marketplace.getListing(${i})' to get the underlying error.`,
                );
                return undefined;
            }


            console.log('listing request', listing);
            // if (listing.type === ListingType.Auction) {
            //     return listing;
            // }

            // if (filterInvalidListings) {
            //     const { valid } = await this.direct.isStillValidListing(listing);
            //     if (!valid) {
            //         return undefined;
            //     }
            // }

            return listing;
        }),
    );
    console.log('listing requests', listings);
    return listings.filter((l) => l !== undefined);
}

Vue.prototype.$getAllListingsNoFilter = async () => {
    console.log('penguinx: getAllListingsNoFilter');
    if (!_penguin_x_marketplace) {
        await loadContracts();
    }
    console.log('getting listings');
    const listings = await Promise.all(
        Array.from(
            Array(
                (await _penguin_x_marketplace.totalListings()).toNumber(),
            ).keys(),
        ).map(async (i) => {
            let listing;

            try {
                listing = await _penguin_x_marketplace.listings(i);
                console.log(listing);
                let name;
                let description;
                let image;
                try {name = await _penguin_x_nft.item_name(i)} catch (error) {console.error('failed getting item_name for', i, error);}
                try {description = await _penguin_x_nft.description(i)} catch (error) {console.error('failed getting description for', i, error);}
                try {image = await _penguin_x_nft.tokenURI(i)} catch (error) {console.error('failed getting tokenURI for', i, error);}
                listing = { ...listing, ...{
                    'id': i,
                    'name': name,
                    'description': description,
                    'image': image,
                }}
                console.log(listing);
            } catch (err) {
                console.error(err);
                console.warn(
                    `Failed to get listing ${i}' - skipping. Try 'marketplace.getListing(${i})' to get the underlying error.`,
                );
                return undefined;
            }


            console.log('listing', listing);
            // if (listing.type === ListingType.Auction) {
            //     return listing;
            // }

            // if (filterInvalidListings) {
            //     const { valid } = await this.direct.isStillValidListing(listing);
            //     if (!valid) {
            //         return undefined;
            //     }
            // }

            return listing;
        }),
    );
    console.log('listings', listings);
    return listings.filter((l) => l !== undefined);
}

Vue.prototype.$getMyListingRequests = async (myAddress) => {
    const listings = await Vue.prototype.$getAllListingRequestsNoFilter();

    const mylistings = listings.filter(
        (listing) =>
            listing.owner.toString().toLowerCase() ===
            myAddress.toLowerCase(),
    );

    return mylistings;
}