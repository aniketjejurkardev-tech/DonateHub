const { network } = require("hardhat");
const { DECIMALS, ANSWER } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  if (chainId == 31337) {
    console.log("Local network detected");
    console.log("Deploying mock contract...");
    const contract = await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, ANSWER],
      log: true,
    });
  }
};

module.exports.tags = ["all", "mocks"];
