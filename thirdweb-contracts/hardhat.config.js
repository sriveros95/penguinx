require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
const { ALCHEMY_KEY, ALCHEMY_KEY_MUMBAI, GOERLI_PRIVATE_KEY_MASTER, GOERLI_PRIVATE_KEY_VERIFIER, GOERLI_PRIVATE_KEY_SELLER, GOERLI_PRIVATE_KEY_BUYER, GOERLI_PRIVATE_KEY_RANDOM } = require("../apis.ts");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    "compilers": [{
      version: "0.8.11",
      settings: {
        optimizer: {
          enabled: true,
          runs: 800
        },
      },
    },
    {
      version: "0.8.9",
      settings: {
        optimizer: {
          enabled: true,
          runs: 800
        },
      },
    },
    {
      version: "0.5.17",
      settings: {
        optimizer: {
          enabled: true,
          runs: 800
        },
      },
    }
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 800
      },
    },
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY_MASTER, GOERLI_PRIVATE_KEY_VERIFIER, GOERLI_PRIVATE_KEY_SELLER, GOERLI_PRIVATE_KEY_BUYER, GOERLI_PRIVATE_KEY_RANDOM]
    },
    matic: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/5W77MmIijUWconkEcgCD59eFaItZG3du`,
      accounts: [GOERLI_PRIVATE_KEY_MASTER, GOERLI_PRIVATE_KEY_VERIFIER, GOERLI_PRIVATE_KEY_SELLER, GOERLI_PRIVATE_KEY_BUYER, GOERLI_PRIVATE_KEY_RANDOM]
    },
    mumbai: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY_MUMBAI}`,
      accounts: [GOERLI_PRIVATE_KEY_MASTER, GOERLI_PRIVATE_KEY_VERIFIER, GOERLI_PRIVATE_KEY_SELLER, GOERLI_PRIVATE_KEY_BUYER, GOERLI_PRIVATE_KEY_RANDOM]
    },
    hardhat: {
      forking: {
        url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      },
      accounts: [{
        "privateKey": GOERLI_PRIVATE_KEY_MASTER,
        "balance": "1000000000000000000000010000000000000000000000"
      }, {
        "privateKey": GOERLI_PRIVATE_KEY_VERIFIER,
        "balance": "1000000000000000000000010000000000000000000000"
      }, {
        "privateKey": GOERLI_PRIVATE_KEY_SELLER,
        "balance": "1000000000000000000000010000000000000000000000"
      }, {
        "privateKey": GOERLI_PRIVATE_KEY_BUYER,
        "balance": "1000000000000000000000010000000000000000000000"
      }, {
        "privateKey": GOERLI_PRIVATE_KEY_RANDOM,
        "balance": "1000000000000000000000010000000000000000000000"
      }]
    },
  }
};
