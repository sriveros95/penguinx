pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PenguinXNFT is ERC721, Ownable {

    address penguin_x_quarters;
    address verifier;               // If set means it has been verified
    string description;

    constructor(
        string memory name,
        string memory _description,
        address _penguin_x_quarters
    ) ERC721 (name, "PNX") public {
        description = _description;
        penguin_x_quarters = _penguin_x_quarters;

        // Mint token 0 for owner
        _mint(msg.sender, 0);
    }

    function getVerifier() public view returns (address) {
        return verifier;
    }

    function verify(address _verifier) public {
        require(msg.sender == penguin_x_quarters, 'NOT_QUARTERS');
        verifier = _verifier;
    }

    function _mint(address to, uint256 tokenId) internal override virtual onlyOwner {
        require(tokenId == 0, 'INVALID');
        super._mint(to, tokenId);
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