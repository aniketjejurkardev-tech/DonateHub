const networkConfig = {
  11155111: {
    name: "Sepolia",
    priceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

const developmentChains = ["localhost", "hardhat"];

const DECIMALS = 8;
const ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  ANSWER,
};
