pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PenguinXNFT is ERC721, Ownable {
    address public penguin_x_quarters;
    address public penguin_x_marketplace;
    address public penguin_x_factory;
    address public verifier; // If set means it has been verified
    address private buyer_address; // If set means it has been bought
    string public base_uri; // Main product image
    string public description;
    uint256 public price;
    uint256 public status; // 0: Listed  1: Bought  2: Delivery In Progress  3: Delivery In Progress Verified  4: Delivery Failed  5: Delivery Succeeded
    mapping(uint256 => uint256) public delivery_prices; // 0: Colombia 1: US
    bytes private delivery_data; // Encrypted data where to deliver
    uint256 private delivery_zone;
    bytes private tracking_code; // Encrypted tracking code

    constructor(
        string memory _name,
        string memory _description,
        string memory _base_uri,
        uint256 _price,
        address _penguin_x_quarters,
        address _penguin_x_marketplace,
        address owner
    ) public ERC721(_name, "PNX") {
        description = _description;
        penguin_x_quarters = _penguin_x_quarters;
        penguin_x_marketplace = _penguin_x_marketplace;
        penguin_x_factory = msg.sender;
        base_uri = _base_uri;
        price = _price;

        // Mint token 0 for owner
        _mint(owner, 0);
        _approve(_penguin_x_marketplace, 0); // Approve marketplace to transfer
    }

    function getVerifier() public view returns (address) {
        return verifier;
    }

    function getPrice(uint256 _delivery_zone) public view returns (uint256) {
        return price + delivery_prices[_delivery_zone];
    }

    function getDeliveryData() public view returns (bytes memory) {
        require(msg.sender == ownerOf(0), "NOT_ALLOWED");
        return delivery_data;
    }

    function getFinalDeliveryData() public view returns (address, address, address, bytes memory, uint256) {
        require(msg.sender == penguin_x_quarters, "NOT_QUARTERS");
        return (penguin_x_marketplace, ownerOf(0), buyer_address, delivery_data, getPrice(delivery_zone));
    }

    function getTrackingCode() public view returns (bytes memory) {
        require(
            msg.sender == ownerOf(0) || msg.sender == penguin_x_quarters,
            "NOT_ALLOWED"
        );
        return tracking_code;
    }

    function verify(address _verifier, uint256[] memory _delivery_prices)
        public
    {
        require(msg.sender == penguin_x_quarters, "NOT_QUARTERS");
        verifier = _verifier;
        for (uint256 index = 0; index < _delivery_prices.length; index++) {
            delivery_prices[index] = _delivery_prices[index];
        }
    }

    function unverify() public {
        require(msg.sender == penguin_x_quarters, "NOT_QUARTERS");
        verifier = address(0);
    }

    function verifyBought(address new_owner) public {
        require(msg.sender == penguin_x_quarters, "NOT_QUARTERS");
        _requireMinted(0);
        require(status == 0, "VB_NOT_LISTED");
        status = 1;
    }

    function addTrackingCode(bytes memory _tracking_code) public {
        require(msg.sender == ownerOf(0) && status == 1, "NOT_ALLOWED");
        tracking_code = _tracking_code;
        status = 2;
    }

    function verifyDeliveryStatus(uint256 _status) public {
        require(msg.sender == penguin_x_quarters, "NOT_QUARTERS");
        require(status == 2 || status == 3, "INVALID_STATE");
        if (_status >= 3 && _status <= 5) {
            status = _status;
        } else {
            revert("INVALID");
        }
        if (status == 3) {
            _transfer(ownerOf(0), buyer_address, 0);
        }
    }

    function verifyDeliveryResult(bool succeeded) public {
        require(msg.sender == penguin_x_quarters, "NOT_QUARTERS");
        require(status == 1, "NOT_BOUGHT");
        if (succeeded) {
            status = 4;
        } else {
            status = 3;
        }
    }

    function _mint(address to, uint256 tokenId)
        internal
        virtual
        override
        onlyOwner
    {
        require(tokenId == 0, "INVALID");
        super._mint(to, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);
        return base_uri;
    }

    function buy(address new_owner, bytes memory _delivery_data, uint256 _delivery_zone) public {
        delivery_data = _delivery_data;
        delivery_zone = _delivery_zone;
        status = 1;
        buyer_address = new_owner;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, firstTokenId, 1);
        if (msg.sender == penguin_x_factory) {
            require(status == 0, "NOT_LISTED");
        } else if (msg.sender == penguin_x_marketplace) {
            // require(status == 0, "NOT_LISTED");
            require(verifier != address(0), "NOT_VERIFIED");
            status = 1;
        } else if (msg.sender != penguin_x_quarters) {
            revert("UNALLOWED");
        }
    }
}
