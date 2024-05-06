require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: {
    compilers: [
      {
        version:  "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 77,
          },
        },
      },
    ]},
  defaultNetwork: 'localhost',
  settings: {
    optimizer: {
      enabled: true,
      runs: 500000
    }
  },
  networks:{
    localhost:{
      allowUnlimitedContractSize: true,
    }
  },
  paths: {
    artifacts: "./app/src/artifacts",
  }
};
