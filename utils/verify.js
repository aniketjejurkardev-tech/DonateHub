const { run } = require("hardhat");
const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  run("verfiy:verify", {
    address: contractAddress,
    constructorArguments: args,
  });
};

module.exports = {
  verify,
};
