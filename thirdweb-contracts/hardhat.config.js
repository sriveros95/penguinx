
require("@nomiclabs/hardhat-waffle");

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
};
