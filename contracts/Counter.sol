// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

contract Counter {
    uint256 public counter;

    event IncrementCounter(uint256 newCounterValue, address msgSender);

    constructor(uint256 initialCount) {
        counter = initialCount;
    }

    function increment() external {
        counter++;
        emit IncrementCounter(counter, msg.sender);
    }
}
