const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const donateHub = await ethers.getContract("DonateHub", deployer);
  console.log(`Got contract DonateHub at ${donateHub.address}`);
  console.log("Funding contract...");
  const transactionResponse = await donateHub.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await transactionResponse.wait();
  console.log("Funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
