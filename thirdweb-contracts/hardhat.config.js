require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
const { ALCHEMY_KEY, GOERLI_PRIVATE_KEY_MASTER, GOERLI_PRIVATE_KEY_VERIFIER, GOERLI_PRIVATE_KEY_SELLER } = require("../apis.ts");

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
      accounts: [GOERLI_PRIVATE_KEY_MASTER, GOERLI_PRIVATE_KEY_VERIFIER, GOERLI_PRIVATE_KEY_SELLER]
    }
  }
};
