// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "hardhat/console.sol";

error DonateHub__NotOwner();

/**
 * @title My DonateHub contract
 * @author Aniket Jejurkar
 * @notice This is a DonateHub contract that collects funds and only withdrawn by the contract creator
 * @dev This contract implements AggregatorV3Interface
 */

contract DonateHub {
    //Type Declaration
    using PriceConverter for uint256;

    //State Variables
    mapping(address => uint256) private addressToAmountFunded;
    address[] public s_funders;
    AggregatorV3Interface s_priceFeed;
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 10 * 10 ** 18;

    //Events

    //Modifiers
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert DonateHub__NotOwner();
        _;
    }

    //Functions

    /* constructor */
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /* receive function */
    receive() external payable {
        fund();
    }

    /* fallback function */
    fallback() external payable {
        fund();
    }

    /* external function */

    /* public function */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    /* internal function */

    /* private function */

    /* view/pure function */
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return addressToAmountFunded[funder];
    }

    function getOwnerAddress() public view returns (address) {
        return i_owner;
    }

    function getFundersArray() public view returns (address[] memory) {
        return s_funders;
    }

    function getBalanceOfDonateHub() public view returns (uint256) {
        return address(this).balance;
    }
}
