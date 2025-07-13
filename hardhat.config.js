require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHILIZ_API_KEY = process.env.CHILIZ_API_KEY;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    chiliz: {
      url: "https://rpc.ankr.com/chiliz",
      chainId: 88888,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    chilizTestnet: {
      url: "https://spicy-rpc.chiliz.com",
      chainId: 88882,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    polygonMumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      chiliz: CHILIZ_API_KEY || "demo-key"
    }
  }
};