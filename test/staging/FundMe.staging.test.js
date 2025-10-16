const { deploymentChains } = require("../../helper-hardhat-config");
const { network, ethers, getNamedAccounts } = require("hardhat");
const { assert } = require("chai");

describe("DonateHub staging testing", () => {
  let deployer, DonateHub;
  const SEND_VALUE = ethers.utils.parseEther("1");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    DonateHub = await ethers.getContract("DonateHub", deployer);
  });
  it("has the initial balance 0", async () => {
    const balance = await ethers.provider.getBalance(DonateHub.address);
    assert.equal(balance, 0);
  });
  it("updates the balance when funded", async () => {
    await DonateHub.fund({ value: SEND_VALUE });
    const balance = await ethers.provider.getBalance(DonateHub.address);
    assert.equal(balance.toString(), SEND_VALUE);
  });
  it("allows the owner to withdraw fund", async () => {
    const startingBalanceOfDonateHub = await ethers.provider.getBalance(
      DonateHub.address
    );
    const startingBalanceOfWithdrawel = await ethers.provider.getBalance(
      deployer
    );
    const transactionReceipt = await DonateHub.withdraw();
    const transactionResponse = await transactionReceipt.wait(1);
    const endingBalanceOfDonateHub = await ethers.provider.getBalance(
      DonateHub.address
    );
    const endingBalanceOfWithdrawel = await ethers.provider.getBalance(
      deployer
    );
    const { gasUsed, effectiveGasPrice } = transactionResponse;
    const gasPrice = gasUsed.mul(effectiveGasPrice);
    assert.equal(endingBalanceOfDonateHub.toString(), "0");
    assert.equal(
      startingBalanceOfDonateHub.add(startingBalanceOfWithdrawel).toString(),
      endingBalanceOfWithdrawel.add(gasPrice).toString()
    );
  });
});
