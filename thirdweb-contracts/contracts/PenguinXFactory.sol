// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./PenguinXNFT.sol";

contract PenguinXFactory is Ownable {
    using Counters for Counters.Counter;

    address public immutable PENGUIN_X_QUARTERS_ADDRESS;

    Counters.Counter private _listingsNonce;

    constructor(address _penguin_x_quarters) {
        PENGUIN_X_QUARTERS_ADDRESS = _penguin_x_quarters;
    }

    function bytesToBytes32(bytes memory b, uint256 offset)
        private
        pure
        returns (bytes32)
    {
        bytes32 out;

        for (uint256 i = 0; i < 32; i++) {
            out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
        }
        return out;
    }

    // Returns the address of the newly deployed contract
    function deployListing(
        string memory _name,
        string memory _description,
        string memory _base_uri,
        address owner
        // int96 _price,
        // bytes32 ipfs_cid
    ) public payable returns (address nft_addr) {
        
        // This syntax is a newer way to invoke create2 without assembly, you just need to pass salt
        // https://docs.soliditylang.org/en/latest/control-structures.html#salted-contract-creations-create2

        bytes32 _salted_bytes = bytesToBytes32(
            abi.encodePacked(_listingsNonce.current()),
            0
        );
        _listingsNonce.increment();
        
        nft_addr = address(
            new PenguinXNFT{salt: _salted_bytes}(
                _name,
                _description,
                _base_uri,
                PENGUIN_X_QUARTERS_ADDRESS,
                owner
            )
        );

        return nft_addr;
    }
}
