pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PenguinXNFT is ERC721, Ownable {

    address penguin_x_quarters;
    address verifier;               // If set means it has been verified
    string base_uri;
    string description;
    uint256 price;

    constructor(
        string memory _name,
        string memory _description,
        string memory _base_uri,
        uint256 _price,
        address _penguin_x_quarters,
        address owner
    ) ERC721 (_name, "PNX") public {
        description = _description;
        penguin_x_quarters = _penguin_x_quarters;
        base_uri = _base_uri;
        price = _price;

        // Mint token 0 for owner
        _mint(owner, 0);
    }

    function getVerifier() public view returns (address) {
        return verifier;
    }

    function getPrice() public view returns (uint256) {
        return price;
    }

    function verify(address _verifier) public {
        require(msg.sender == penguin_x_quarters, 'NOT_QUARTERS');
        verifier = _verifier;
    }

    function _mint(address to, uint256 tokenId) internal override virtual onlyOwner {
        require(tokenId == 0, 'INVALID');
        super._mint(to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        return base_uri;
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