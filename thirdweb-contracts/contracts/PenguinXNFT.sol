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
    uint256 public listing_id;
    uint256 public price;
    uint256 public status; // 0 Pending Verification  1: Verification Failed  2: Delisted by seller  3: Delisted by Penguin  10: Listed  20: Bought  30: Delivery In Progress  31: Delivery In Progress Verified  32: Delivery Failed  42: Delivery Succeeded
    mapping(uint256 => uint256) public delivery_prices; // 0: Colombia 1: US
    bytes private delivery_data;    // Encrypted data where to deliver
    uint256 private delivery_zone;  // For estimating delivery prices
    bytes private tracking_code;    // Encrypted tracking code
    string public constant version = "0.1";          // PenguinX Version

    constructor(
        string memory _name,
        string memory _description,
        string memory _base_uri,
        uint256 _price,
        uint256 _listing_id,
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
        listing_id = _listing_id;

        // Mint token 0 for owner
        _mint(owner, 0);
        _approve(_penguin_x_marketplace, 0); // Approve marketplace to transfer
    }

    function getVerifier() public view returns (address) {
        return verifier;
    }

    function getListingInfo() public view returns (uint256 listingId, address verifierAddress, address ownerAddress) {
        return (listing_id, verifier, ownerOf(0));
    }

    function getPrice(uint256 _delivery_zone) public view returns (uint256) {
        return price + delivery_prices[_delivery_zone];
    }

    function getDeliveryData() public view returns (bytes memory) {
        require(msg.sender == ownerOf(0), "GDD_NOT_ALLOWED");
        return delivery_data;
    }

    function getFinalDeliveryData() public view returns (address, address, address, bytes memory, uint256) {
        require(msg.sender == penguin_x_quarters, "NOT_QUARTERS");
        return (penguin_x_marketplace, ownerOf(0), buyer_address, delivery_data, getPrice(delivery_zone));
    }

    function getTrackingCode() public view returns (bytes memory) {
        require(
            msg.sender == ownerOf(0) || msg.sender == penguin_x_quarters,
            "GTC_NOT_ALLOWED"
        );
        return tracking_code;
    }

    function verify(address _verifier, uint256[] memory _delivery_prices)
        public
    {
        require(msg.sender == penguin_x_quarters, "NOT_QUARTERS");
        verifier = _verifier;
        status = 10;
        for (uint256 index = 0; index < _delivery_prices.length; index++) {
            delivery_prices[index] = _delivery_prices[index];
        }
    }

    function delist() public {
        require(status == 10, 'NOT_LISTED');
        if(msg.sender == penguin_x_quarters) {
            status = 3;
        }else if (msg.sender == penguin_x_marketplace) {
            status = 2;
        }else{
            revert("DL_NOT_ALLOWED");
        }
    }

    function addTrackingCode(bytes memory _tracking_code) public {
        require(msg.sender == penguin_x_marketplace && status == 1, "ATC_NOT_ALLOWED");
        tracking_code = _tracking_code;
        status = 2;
    }

    function verifyDeliveryStatus(uint256 _status) public {
        require(msg.sender == penguin_x_quarters, "VDS_NOT_QUARTERS");
        require(status == 2 || status == 3, "VDS_INVALID_STATE");
        if (_status >= 3 && _status <= 5) {
            status = _status;
        } else {
            revert("VDS_INVALID");
        }
        if (status == 3) {
            _transfer(ownerOf(0), buyer_address, 0);
        }
    }

    function verifyDeliveryResult(bool succeeded) public {
        require(msg.sender == penguin_x_quarters, "VDD_NOT_QUARTERS");
        require(status == 1, "VDD_NOT_BOUGHT");
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
        require(tokenId == 0, "MT_INVALID");
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
            require(status == 0, "NOT_BIRTH");
        } else if (msg.sender == penguin_x_marketplace) {
            require(status == 10, "BFTT_NOT_LISTED");
            require(verifier != address(0), "BFTT_NOT_VERIFIED");
            status = 1;
        } else if (msg.sender != penguin_x_quarters) {
            revert("BFTT_UNALLOWED");
        }
    }
}
