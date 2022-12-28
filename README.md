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

## Deploy localhost (hardhat)
npx hardhat run --network localhost scripts/deploy.js

## Deploy goerly
npx hardhat run --network goerly scripts/deploy.js


## Improvement ideas
- All listings be the same 721 contract with different ids, instead of one contract for every owner?
    - for now we can use alchemy to list all tokens and filter penguin x's