import Vue from "vue";
import axios from 'axios';

import { ethers } from "ethers";
const { BigNumber } = require('ethers');
import { ABI_ERC20, ABI_MARKETPLACE, ABI_NFT } from "~/abis";
import { PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_NFT_ADDRESS, USDC_ADDRESS } from "~/constants";

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
let _usdc;

async function loadContracts() {
    console.log('penguinx: loadContracts');
    try {
        _provider = new ethers.providers.Web3Provider(window.ethereum);
        _signer = _provider.getSigner();
        _penguin_x_marketplace = new ethers.Contract(PENGUIN_X_MARKETPLACE_ADDRESS, ABI_MARKETPLACE, _signer);
        _penguin_x_nft = new ethers.Contract(PENGUIN_X_NFT_ADDRESS, ABI_NFT, _signer);
        _usdc = new ethers.Contract(USDC_ADDRESS, ABI_ERC20, _signer);
    } catch (error) {
        console.log('failed to get provider');
    }
    console.log('penguinx: contracts loaded', _usdc);
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
                try { name = await _penguin_x_nft.item_name(i) } catch (error) { console.error('failed getting item_name for', i, error); }
                try { description = await _penguin_x_nft.description(i) } catch (error) { console.error('failed getting description for', i, error); }
                try { image = await _penguin_x_nft.tokenURI(i) } catch (error) { console.error('failed getting tokenURI for', i, error); }
                listing = {
                    ...listing, ...{
                        'id': i,
                        'name': name,
                        'description': description,
                        'image': image,
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

Vue.prototype.$getPenguinXNFTDets = async (i) => {
    if (!_penguin_x_nft) {
        await loadContracts();
    }
    let name;
    let description;
    let base_uri;
    try { name = await _penguin_x_nft.item_name(i) } catch (error) { console.error('failed getting item_name for', i, error); }
    try { description = await _penguin_x_nft.description(i) } catch (error) { console.error('failed getting description for', i, error); }
    try { base_uri = await _penguin_x_nft.tokenURI(i) } catch (error) { console.error('failed getting tokenURI for', i, error); }
    return {
        "name": name,
        "description": description,
        "base_uri": base_uri
    };
}

Vue.prototype.$getPenguinXNFTDeliveryPrice = async (i, l) => {
    if (!_penguin_x_nft) { await loadContracts(); }
    try { return await _penguin_x_nft.delivery_prices(i, l) } catch (error) { console.error('failed getting delivery_prices for', i, l, error); }
}

Vue.prototype.$approvePenguinXUSDC = async (total_price) => {
    console.log('approvePenguinXUSDC', total_price);
    if (!_usdc) {
        await loadContracts();
    }
    // approve marketplace
    await _usdc?.approve(PENGUIN_X_MARKETPLACE_ADDRESS, total_price);
    return true;
}

Vue.prototype.$buyPenguinXNFT = async (i, total_price, buyer_address, delivery_zone, delivery_data) => {
    console.log('buyPenguinXNFT', i, total_price, buyer_address, delivery_zone, delivery_data);
    if (!_penguin_x_marketplace) {
        await loadContracts();
    }

    console.log(',,,');
    const tx = await _penguin_x_marketplace.buy(
        i,
        buyer_address,
        1,
        USDC_ADDRESS,
        total_price,
        delivery_data
    )

    console.log('buy request tx:', tx);
    const txReceipt = await tx.wait();
    console.log('buy request events', txReceipt.events);
    const NewSaleEvent = _.find(txReceipt.events, { 'event': 'NewSale' });
    console.log('NewSaleEvent', NewSaleEvent);
    // const [listing_request_id] = NewSaleEvent.args;
    // console.log('listing request id', listing_request_id);
    // return listing_request_id;
    return true
}
