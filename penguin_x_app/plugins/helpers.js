import Vue from "vue";
import axios from 'axios';

import { ethers } from "ethers";
const { BigNumber } = require('ethers');
import { ABI_ERC20, ABI_MARKETPLACE, ABI_NFT } from "~/abis";
import { ALCHEMY_PROVIDER, PENGUIN_X_MARKETPLACE_ADDRESS, PENGUIN_X_NFT_ADDRESS, PINATA_BEARER, USDC_ADDRESS } from "~/constants";

const _JWT = `Bearer ${PINATA_BEARER}`
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
let _pub_penguin_x_marketplace;
let _pub_penguin_x_nft;
let _total_listings = undefined;

const _cached_listings = {}

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

// pub stands for public
// allows to query the contracts without the user connecting the wallet
// we are using alchemy for this
async function loadContractsPub() {
    console.log('penguinx: loadContractsPub');
    try {
        _pub_penguin_x_marketplace = new _web3Pub.eth.Contract(ABI_MARKETPLACE, PENGUIN_X_MARKETPLACE_ADDRESS);
        console.log('penguinx: loadContractsPub _pub_penguin_x_marketplace:', _pub_penguin_x_marketplace);
        _pub_penguin_x_nft = new _web3Pub.eth.Contract(ABI_NFT, PENGUIN_X_NFT_ADDRESS);
        console.log('penguinx: loadContractsPub _pub_penguin_x_nft:', _pub_penguin_x_nft);
        // _usdc = new ethers.Contract(USDC_ADDRESS, ABI_ERC20, _signer);
    } catch (error) {
        console.error('loadContractsPub failed', error);
    }
    console.log('penguinx: contracts loadedPub', _usdc);
}


const utf8Encode = new TextEncoder()
Vue.prototype.$utf8Encode = (str) => {
    return utf8Encode.encode(str)
}


Vue.prototype.$loadMetadata = async (uri) => {
    console.log('load_metadata metadata', uri);
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

const { createAlchemyWeb3: _createAlchemyWeb3 } = require("@alch/alchemy-web3");
const _web3Pub = _createAlchemyWeb3(ALCHEMY_PROVIDER);

Vue.prototype.$getListingsPub = async (page = 0) => {
    if (!_pub_penguin_x_marketplace) {await loadContractsPub();}
    console.log('penguinx: getListingsPub');
    const PAGE_SIZE = 6
    try {
        let listings = []
        const start_at = page * PAGE_SIZE
        for (let i = start_at; i < start_at + PAGE_SIZE; i++) {
            let listing;
            console.log('getting listing', i);
            try {
                listing = await _pub_penguin_x_marketplace.methods.listings(i).call();
                console.log(listing);
                let name;
                let description;
                let image;
                try { name = await _pub_penguin_x_nft.methods.item_name(i).call() } catch (error) { console.error('failed getting item_name for', i, error); }
                try { description = await _pub_penguin_x_nft.methods.description(i).call() } catch (error) { console.error('failed getting description for', i, error); }
                try { image = await _pub_penguin_x_nft.methods.tokenURI(i).call() } catch (error) { console.error('failed getting tokenURI for', i, error); }
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
            listings.push(listing)
        }
        console.log('listings', listings);
        listings = listings.filter((l) => l !== undefined);
        _cached_listings[`p${page}`] = listings
        return listings;
        
    } catch (error) {
        console.error(error);
    }
}

Vue.prototype.$getTotalListingsPub = async () => {
    if (!_pub_penguin_x_marketplace) {await loadContractsPub();}
    if (_total_listings !== undefined) {return _total_listings}
    _total_listings = await _pub_penguin_x_marketplace.methods.totalListings().call()
    console.log('getTotalListingsPub total:', _total_listings);
    return _total_listings
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

Vue.prototype.$getListingsSoldBy = async (leaddress) => {
    const listings = await Vue.prototype.$getAllListingsNoFilter();

    const mylistings = listings.filter(
        (listing) =>
            listing.tokenOwner.toString().toLowerCase() ===
            leaddress.toLowerCase(),
    );

    return mylistings;
}

Vue.prototype.$getListingsBoughtBy = async (leaddress) => {
    const listings = await Vue.prototype.$getAllListingsNoFilter();

    const mylistings = listings.filter(
        (listing) =>
            listing.tokenBuyer.toString().toLowerCase() ===
            leaddress.toLowerCase(),
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
    let status;
    try { name = await _penguin_x_nft.item_name(i) } catch (error) { console.error('failed getting item_name for', i, error); }
    try { description = await _penguin_x_nft.description(i) } catch (error) { console.error('failed getting description for', i, error); }
    try { base_uri = await _penguin_x_nft.tokenURI(i) } catch (error) { console.error('failed getting tokenURI for', i, error); }
    try { status = await _penguin_x_marketplace.status(i); } catch (error) { console.error('failed getting status for', i, error); }
    return {
        "name": name,
        "description": description,
        "base_uri": base_uri,
        "status": status,
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
    const tx = await _usdc?.approve(PENGUIN_X_MARKETPLACE_ADDRESS, total_price);
    const txw = await tx.wait();
    console.log('approval awaited');
    return txw;
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
    return txReceipt
}


Vue.prototype.$getDeliveryData = async (i) => {
    console.log('getDeliveryData', i);
    if (!_penguin_x_marketplace) {
        await loadContracts();
    }

    console.log(',,,');
    const dd = await _penguin_x_marketplace.getDeliveryData(i);

    console.log('dd:', dd);
    return dd
}


Vue.prototype.$addTrackingData = async (i, tracking_code, delivery_proof) => {
    console.log('getDeliveryData', i);
    if (!_penguin_x_marketplace) {
        await loadContracts();
    }

    console.log(',,,');
    const dd = await _penguin_x_marketplace.addTrackingCode(i, tracking_code, delivery_proof);

    console.log('dd:', dd);
    return dd
}


// IPFS Helpers
Vue.prototype.$pinFileToIPFS = async (file) => {
    const formData = new FormData();

    formData.append('file', file)

    const metadata = JSON.stringify({
        name: 'PX_IMAGE',
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    })
    formData.append('pinataOptions', options);


    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: _JWT
        }
    });
    console.log('go ipfs go go go!', res.data);

    return `ipfs://${res.data.IpfsHash}`
}

Vue.prototype.$pinJSONToIPFS = async (metadata) => {
    console.log('pinJSONToIPFS', metadata);
    var data = JSON.stringify({
        "pinataOptions": {
            "cidVersion": 1
        },
        "pinataMetadata": {
            "name": "PX_META",
        },
        "pinataContent": metadata
    });

    var config = {
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': _JWT
        },
        data: data
    };

    const res = await axios(config);

    console.log('go ipfs go go go!', res.data);

    return `ipfs://${res.data.IpfsHash}`
}
