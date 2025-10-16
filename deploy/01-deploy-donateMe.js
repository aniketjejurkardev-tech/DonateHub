const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  let priceFeedAddress;
  const chainId = network.config.chainId;
  if (chainId != 31337) {
    priceFeedAddress = networkConfig[chainId].priceFeedAddress;
  } else {
    const mockV3Aggregator = await deployments.get("MockV3Aggregator");
    priceFeedAddress = mockV3Aggregator.address;
  }
  const args = [priceFeedAddress];
  const contract = await deploy("DonateHub", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmation: network.config.blockConfirmation,
  });
  console.log(`Contract deployed at address: ${contract.address}`);
  // if (chainId != 31337) {
  //   await verify(contract.address, args);
  // }
};

module.exports.tags = ["all", "DonateHub"];
