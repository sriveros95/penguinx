# penguinx

## Config 
Create a file named apis.ts in the root directory with the following data (replacing the < values >)

```json
const ALCHEMY_KEY = "<ALCHEMY_KEY>";
const GOERLI_PRIVATE_KEY_MASTER = "<GOERLI_PRIVATE_KEY_MASTER>";
const GOERLI_PRIVATE_KEY_VERIFIER = "<GOERLI_PRIVATE_KEY_VERIFIER>";
const GOERLI_PRIVATE_KEY_SELLER = "<GOERLI_PRIVATE_KEY_SELLER>";

module.exports = {
    ALCHEMY_KEY, 
    GOERLI_PRIVATE_KEY_MASTER,
    GOERLI_PRIVATE_KEY_VERIFIER,
    GOERLI_PRIVATE_KEY_SELLER
}
```

### Run backend
cd cend; 
uvicorn main:app --reload;

## Deploy localhost (hardhat)
npx hardhat run --network localhost scripts/deploy.js

## Deploy goerly
npx hardhat run --network goerly scripts/deploy.js


## Improvement ideas
- All listings be the same 721 contract with different ids, instead of one contract for every owner?
    - for now we can use alchemy to list all tokens and filter penguin x's


## Flow
- A listed element has an NFT representation
    - Weight and dimensions are stored in the metadata in ipfs

- Front end will call our centralized backend (cend)
    - notify team
    - calculate delivery (v0 has fixed delivery locations)

- When bought: 
    - Delivery data is encrypted (only buyer can see)
    - Delivery cost is calculated by centralized backend, verifier then records this in blockchain
    - Money is kept in escrow until delivery in progress is confirmed
