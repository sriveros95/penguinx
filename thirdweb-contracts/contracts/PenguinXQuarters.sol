// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";

import "../interfaces/IPenguinXMarketplace.sol";
import "./PenguinXNFT.sol";
import "./PenguinXMarketPlace.sol";

contract PenguinXQuarters is Ownable {
    // using Counters for Counters.Counter;

    address constant USDC_ADDRESS = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;              // Polygon
    // address constant USDC_ADDRESS = 0xEEa85fdf0b05D1E0107A61b4b4DB1f345854B952;  // Goerli

    // Authorized verifiers
    mapping(address => bool) public authorizedVerifiers;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {}

    function setVerifier(address verifier, bool is_authorized)
        public
        onlyOwner
    {
        authorizedVerifiers[verifier] = is_authorized;
    }

    function isVerifier(address verifier) public view returns (bool) {
        return authorizedVerifiers[verifier];
    }

    function verify(address penguin_x_nft, uint256[] memory _delivery_prices)
        public
    {
        require(isVerifier(msg.sender), "NOT_VERIFIER");
        PenguinXNFT(penguin_x_nft).verify(msg.sender, _delivery_prices);
    }

    function verifyDeliveryStatus(address penguin_x_nft, uint256 _status)
        public
    {
        require(isVerifier(msg.sender), "NOT_VERIFIER");

        if (_status == 3) {
            (
                address marketplace,
                address seller,
                address buyer,
                bytes memory delivery_data,
                uint256 price
            ) = PenguinXNFT(penguin_x_nft).getFinalDeliveryData();
            IPenguinXMarketplace(marketplace).executePayout(
                IPenguinXMarketplace(marketplace).getListing(0),
                seller,
                USDC_ADDRESS,
                price,
                1
            );
        }

        PenguinXNFT(penguin_x_nft).verifyDeliveryStatus(_status);
    }

    function getTrackingCode(address penguin_x_nft)
        public
        view
        returns (bytes memory)
    {
        require(isVerifier(msg.sender), "NOT_VERIFIER");
        return PenguinXNFT(penguin_x_nft).getTrackingCode();
    }
}
