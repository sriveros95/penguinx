pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PenguinXNFT is ERC721 {

    address verifier;

    constructor(
        string memory name,
        address _verifier) ERC721 (name, "PNX") public {
        verifier = _verifier;
    }

    function getVerifier() public view returns (address) {
        return verifier;
    }

    // function _beforeTokenTransfer(address from, address to, uint256 amount)
    //     internal virtual override
    // {
    //     super._beforeTokenTransfer(from, to, amount);

    //     require(_validRecipient(to), "ERC20WithSafeTransfer: invalid recipient");
    // }

    // function _validRecipient(address to) private view returns (bool) {
    //     ...
    // }

    // ...
}