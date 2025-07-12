require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Chiliz Spicy Testnet
    spicy: {
      url: "https://spicy-rpc.chiliz.com/",
      chainId: 88882,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
      timeout: 60000, // 1 minute timeout
    },
    // RPC alternatif plus rapide
    spicy2: {
      url: "https://chiliz-spicy-rpc.publicnode.com",
      chainId: 88882,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei (très bas pour testnet)
      timeout: 60000,
    },
    // Chiliz Mainnet (pour plus tard)
    chiliz: {
      url: "https://rpc.ankr.com/chiliz",
      chainId: 88888,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000,
    }
  },
  etherscan: {
    // Pour vérifier les contrats sur Chiliz
    apiKey: {
      spicy: "abc", // Pas besoin de vraie clé pour Spicy
      chiliz: "abc"
    },
    customChains: [
      {
        network: "spicy",
        chainId: 88882,
        urls: {
          apiURL: "https://spicy-explorer.chiliz.com/api",
          browserURL: "https://spicy-explorer.chiliz.com"
        }
      },
      {
        network: "chiliz",
        chainId: 88888,
        urls: {
          apiURL: "https://explorer.chiliz.com/api",
          browserURL: "https://explorer.chiliz.com"
        }
      }
    ]
  }
};
