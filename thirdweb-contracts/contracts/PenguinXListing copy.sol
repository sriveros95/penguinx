// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract PenguinXListing {
    using Counters for Counters.Counter;
    // using SafeMathUpgradeable for uint256;
    
    Counters.Counter private _tokenIdCounter;
    
    constructor() {}
}