pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract interface IPenguinXNFT is ERC721 {

    constructor(
        string name,
        address _verifier) external;

    function getVerifier() external view returns (address);
}