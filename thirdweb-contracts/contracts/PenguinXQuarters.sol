// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";

import "./PenguinXNFT.sol";

contract PenguinXQuarters is Ownable {
    // using Counters for Counters.Counter;

    // Authorized verifiers
    mapping(address => bool) public authorizedVerifiers;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {}

    function setVerifier(address verifier, bool is_authorized) public onlyOwner {
        authorizedVerifiers[verifier] = is_authorized;
    }

    function isVerifier(address verifier) public returns (bool) {
        return authorizedVerifiers[verifier];
    }

    function verify(address penguin_x_nft) public {
        require(isVerifier(msg.sender), 'NOT_VERIFIER');
        PenguinXNFT(penguin_x_nft).verify(msg.sender);
    }
}
