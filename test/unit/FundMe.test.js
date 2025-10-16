const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { expect, assert } = require("chai");
const { deploymentChains } = require("../../helper-hardhat-config");

network.config.chainId != 31337
  ? describe.skip
  : describe("DonateHub", () => {
      let DonateHub;
      let mockV3Aggregator;
      const SEND_VALUE = ethers.utils.parseEther("1");
      const NUM_ACCOUNTS = 6;
      let deployer;
      let counter = 0;
      beforeEach(async () => {
        counter++;
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        DonateHub = await ethers.getContract("DonateHub", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", () => {
        it("sets the aggregator address correctly", async () => {
          const response = await DonateHub.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });
      describe("fund", () => {
        it("should send enough eth", async () => {
          await expect(DonateHub.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
        it("should store the funder address correctly", async () => {
          await DonateHub.fund({ value: SEND_VALUE });
          const amtStored = await DonateHub.getAddressToAmountFunded(deployer);
          assert.equal(amtStored.toString(), SEND_VALUE.toString());
        });
        it("should add funder to funders array", async () => {
          await DonateHub.fund({ value: SEND_VALUE });
          assert.equal((await DonateHub.getFundersArray())[0], deployer);
        });
      });
      describe("withdraw", () => {
        beforeEach(async () => {
          await DonateHub.fund({ value: SEND_VALUE });
        });
        it("should withdraw funds correctly", async () => {
          const startingBalanceOfDonateHub = await ethers.provider.getBalance(
            DonateHub.address
          );
          const startingBalanceoOfWithdrawel = await ethers.provider.getBalance(
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
            startingBalanceOfDonateHub
              .add(startingBalanceoOfWithdrawel)
              .toString(),
            endingBalanceOfWithdrawel.add(gasPrice).toString()
          );
        });
        it("should work correctly with multiple funders", async () => {
          const accounts = await ethers.getSigners();
          for (i = 1; i <= NUM_ACCOUNTS; i++) {
            const connectedAccountOfNewFunder = await DonateHub.connect(
              accounts[i]
            );
            await connectedAccountOfNewFunder.fund({ value: SEND_VALUE });
          }
          const DonateHubBalance = await ethers.provider.getBalance(
            DonateHub.address
          );
          const sendValue = SEND_VALUE.toBigInt();
          const amtFundedByFunders = sendValue * BigInt(NUM_ACCOUNTS + 1);
          console.log(`DonateHub balance: ${DonateHubBalance}`);
          assert.equal(
            DonateHubBalance.toString(),
            amtFundedByFunders.toString()
          );
        });
        it("should only allow owner to withdraw funds", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const connectedAccountOfNewFunder = await DonateHub.connect(attacker);
          await expect(
            connectedAccountOfNewFunder.withdraw()
          ).to.be.revertedWith("DonateHub__NotOwner");
        });
        it("resets the storage variables after owner withdraws the fund", async () => {
          const accounts = await ethers.getSigners();
          for (i = 1; i <= NUM_ACCOUNTS; i++) {
            const connectedAccountOfNewFunder = await DonateHub.connect(
              accounts[i]
            );
            await connectedAccountOfNewFunder.fund({ value: SEND_VALUE });
          }
          const fundersArray = await DonateHub.getFundersArray();
          const fundersArraySize = fundersArray.length;
          assert.equal(fundersArraySize, NUM_ACCOUNTS + 1);
          for (i = 0; i <= NUM_ACCOUNTS; i++) {
            const funderAddress = fundersArray[i];
            assert.equal(funderAddress, accounts[i].address);
            assert.equal(
              (
                await DonateHub.getAddressToAmountFunded(accounts[i].address)
              ).toString(),
              SEND_VALUE
            );
          }
          await DonateHub.withdraw();
          const newFundersArray = await DonateHub.getFundersArray();
          const newFundersArraySize = newFundersArray.length;
          assert.equal(newFundersArraySize, 0);
          for (i = 1; i <= NUM_ACCOUNTS; i++) {
            assert.equal(
              await DonateHub.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
      describe("cheaperWithdraw", () => {
        beforeEach(async () => {
          await DonateHub.fund({ value: SEND_VALUE });
        });
        it("should withdraw funds correctly", async () => {
          const startingBalanceOfDonateHub = await ethers.provider.getBalance(
            DonateHub.address
          );
          const startingBalanceoOfWithdrawel = await ethers.provider.getBalance(
            deployer
          );
          const transactionReceipt = await DonateHub.cheaperWithdraw();
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
            startingBalanceOfDonateHub
              .add(startingBalanceoOfWithdrawel)
              .toString(),
            endingBalanceOfWithdrawel.add(gasPrice).toString()
          );
        });
        it("should work correctly with multiple funders", async () => {
          const accounts = await ethers.getSigners();
          for (i = 1; i <= NUM_ACCOUNTS; i++) {
            const connectedAccountOfNewFunder = await DonateHub.connect(
              accounts[i]
            );
            await connectedAccountOfNewFunder.fund({ value: SEND_VALUE });
          }
          const DonateHubBalance = await ethers.provider.getBalance(
            DonateHub.address
          );
          const sendValue = SEND_VALUE.toBigInt();
          const amtFundedByFunders = sendValue * BigInt(NUM_ACCOUNTS + 1);
          console.log(`DonateHub balance: ${DonateHubBalance}`);
          assert.equal(
            DonateHubBalance.toString(),
            amtFundedByFunders.toString()
          );
        });
        it("should only allow owner to withdraw funds", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const connectedAccountOfNewFunder = await DonateHub.connect(attacker);
          await expect(
            connectedAccountOfNewFunder.cheaperWithdraw()
          ).to.be.revertedWith("DonateHub__NotOwner");
        });
        it("resets the storage variables after owner withdraws the fund", async () => {
          const accounts = await ethers.getSigners();
          for (i = 1; i <= NUM_ACCOUNTS; i++) {
            const connectedAccountOfNewFunder = await DonateHub.connect(
              accounts[i]
            );
            await connectedAccountOfNewFunder.fund({ value: SEND_VALUE });
          }
          const fundersArray = await DonateHub.getFundersArray();
          const fundersArraySize = fundersArray.length;
          assert.equal(fundersArraySize, NUM_ACCOUNTS + 1);
          for (i = 0; i <= NUM_ACCOUNTS; i++) {
            const funderAddress = fundersArray[i];
            assert.equal(funderAddress, accounts[i].address);
            assert.equal(
              (
                await DonateHub.getAddressToAmountFunded(accounts[i].address)
              ).toString(),
              SEND_VALUE
            );
          }
          await DonateHub.cheaperWithdraw();
          const newFundersArray = await DonateHub.getFundersArray();
          const newFundersArraySize = newFundersArray.length;
          assert.equal(newFundersArraySize, 0);
          for (i = 1; i <= NUM_ACCOUNTS; i++) {
            assert.equal(
              await DonateHub.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
    });
