require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    mantleSepolia: {
      url: "https://rpc.sepolia.mantle.xyz",
      chainId: 5003,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};