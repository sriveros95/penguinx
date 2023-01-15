pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract PenguinXNFT is ERC721URIStorage {
    address public PENGUIN_X_MARKETPLACE;
    
    mapping(uint256 => string) public description;
    mapping(uint256 => address) public verifier;                                // If set means it has been verified
    mapping(uint256 => mapping(uint256 => uint256)) public delivery_prices;     // 0 N/A  1: Colombia  2: US  3: Canada
    
    // Status
    // 0: N/A
    // 1: Verification Removed
    // 2: Delisted by seller
    // 3: Delisted by Penguin
    // 4: Bought, *Delivery Verification Failed, Escrow Returned
    // 10: Listed (Verified)
    // 20: Bought (Payment Escrowed)*
    // 29: Bought, Delivery Verification Failed (Need to solve before escrow returned)
    // 30: Delivery In Progress (Marked by Seller)
    // 31: Delivery In Progress Verified
    // 32: Delivery was verified but Failed
    // 42: Delivery Succeeded
    mapping(uint256 => uint256) private status;
    mapping(uint256 => address) public buyer_address;       // ETH Address (Buyer's wallet) If set means it has been bought
    mapping(uint256 => bytes) private delivery_data;        // Encrypted data where to deliver
    mapping(uint256 => uint256) private delivery_zone;      // For estimating delivery prices
    mapping(uint256 => bytes) private tracking_code;        // Encrypted tracking code
    mapping(uint256 => string) private delivery_proof;      // Encrypted delivery proof (for now ipfs uri of picture)
    
    string public constant version = "0.2";                 // PenguinX Version

    constructor(
        string memory _name,
        address _penguin_x_marketplace
    ) public ERC721(_name, "PGX") {
        PENGUIN_X_MARKETPLACE = _penguin_x_marketplace;
    }

    function getVerifier(uint256 _listing_id) public view returns (address) {
        return verifier[_listing_id];
    }

    function getBuyer(uint256 _listing_id) public view returns (address) {
        return buyer_address[_listing_id];
    }

    function getDeliveryPrice(uint256 _listing_id, uint256  _delivery_zone) public view returns (uint256) {
        return delivery_prices[_listing_id][_delivery_zone];
    }

    function getDeliveryInfo(uint256 _listing_id) public view returns (uint256 _delivery_zone, bytes memory _delivery_data, bytes memory _tracking_code) {
        require(msg.sender == PENGUIN_X_MARKETPLACE || msg.sender == buyer_address[_listing_id], "GDI_NOT_ALLOWED");
        return (delivery_zone[_listing_id], delivery_data[_listing_id], tracking_code[_listing_id]);
    }

    function getStatus(uint256 _listing_id) public view returns (uint256){
        return status[_listing_id];
    }

    // function getFinalDeliveryData(uint256 _listing_id) public view returns (address, address, address, bytes memory, uint256) {
    //     require(msg.sender == PENGUIN_X_MARKETPLACE, "NOT_MARKETPLACE");
    //     return (PENGUIN_X_MARKETPLACE, ownerOf(0), buyer_address, delivery_data, getDeliveryPrice(delivery_zone));
    // }

    function delist(uint256 _listing_id, uint256 _status) public {
        require(msg.sender == PENGUIN_X_MARKETPLACE, 'DL_NOT_MARKETPLACE');
        require(status[_listing_id] == 10, 'DL_NOT_LISTED');
        require(_status == 2 || _status == 3, 'DL_INVALID');
        status[_listing_id] = _status;
    }

    function addTrackingCode(uint256 _listing_id, bytes memory _tracking_code, string memory _delivery_proof) public {
        require(msg.sender == PENGUIN_X_MARKETPLACE && status[_listing_id] == 20, "ATC_NOT_ALLOWED");
        tracking_code[_listing_id] = _tracking_code;
        delivery_proof[_listing_id] = _delivery_proof;
        status[_listing_id] = 30; // Delivery In Progress (Marked by Seller)
    }

    function verifyDeliveryStatus(uint256 _listing_id, uint256 _status) public {
        require(msg.sender == PENGUIN_X_MARKETPLACE, "VDP_NOT_MARKETPLACE");
        if (_status >= 29 && _status <= 31) {                           // Verifier can only mark as 31 (Delivery In Progress Verified) or 29 (Bought, Delivery Verification Failed (Need to solve before escrow))
            require(status[_listing_id] == 30, "VDP_INVALID_STATE");    // Listing has to be marked as delivery in progress by seller
        } else if (_status == 4){
            require(status[_listing_id] == 29, "VDP_INVALID_STATE");    // Bought, Delivery Verification Failed, Escrow Returned
        } else {
            revert("VDS_INVALID");
        }
        status[_listing_id] = _status;
        if (_status == 31) {
            // Transfer NFT to buyer
            _transfer(ownerOf(_listing_id), buyer_address[_listing_id], _listing_id);
        }
    }

    function verifyDeliveryResult(uint256 _listing_id, bool succeeded) public {
        require(msg.sender == PENGUIN_X_MARKETPLACE, "VDD_NOT_MARKETPLACE");
        require(status[_listing_id] == 31, "VDR_NOT_TRANSIT");
        if (succeeded) {
            status[_listing_id] = 42;
        } else {
            status[_listing_id] = 32;
        }
    }

    function x_mint(
        address _verifier,
        uint256[] memory _delivery_prices,
        string memory _description,
        string memory _tokenURI,
        address _owner,
        uint256 _token_id
    ) public {
        require(msg.sender == PENGUIN_X_MARKETPLACE, "MT_NOT_MARKETPLACE");

        description[_token_id] = _description;
        verifier[_token_id] = _verifier;
        status[_token_id] = 10;                     // Listed (Verified)
        for (uint256 index = 0; index < _delivery_prices.length; index++) {
            delivery_prices[_token_id][index] = _delivery_prices[index];
        }

        _mint(_owner, _token_id);
        _setTokenURI(_token_id, _tokenURI);
        _approve(PENGUIN_X_MARKETPLACE, _token_id); // Approve marketplace to transfer

        // buyer_address[tokenId] = _buyer_address;
        // delivery_data[tokenId] = _delivery_data;
        // delivery_zone[tokenId] = _delivery_zone;
        // tracking_code[tokenId] = _tracking_code;
        // delivery_proof[tokenId] = _delivery_proof;
    }

    function _mint(address to, uint256 tokenId)
        internal
        virtual
        override
    {
        require(msg.sender == PENGUIN_X_MARKETPLACE, "MT_NOT_MARKETPLACE");
        super._mint(to, tokenId);
    }

    function approve(address to, uint256 tokenId) public virtual override {
        revert("NOT_ALLOWED");
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        _requireMinted(tokenId);
        return super.tokenURI(tokenId);
    }

    function buy(uint256 _token_id, address new_owner, bytes memory _delivery_data, uint256 _delivery_zone) public {
        require(msg.sender == PENGUIN_X_MARKETPLACE, 'BUY_NOT_MARKETPLACE');
        require(status[_token_id] == 10, "BUY_NOT_LISTED");
        delivery_data[_token_id] = _delivery_data;
        delivery_zone[_token_id] = _delivery_zone;
        status[_token_id] = 20; // Bought (Payment Escrowed)
        buyer_address[_token_id] = new_owner;
        _transfer(ownerOf(_token_id), address(this), _token_id);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, firstTokenId, 1);
        if (msg.sender == PENGUIN_X_MARKETPLACE) {
            require(verifier[firstTokenId] != address(0), "BFTT_NOT_VERIFIED");
            // require(status[firstTokenId] == 20, "BFTT_NOT_BOUGHT");
        } else {
            revert("BFTT_UNALLOWED");
        }
    }
}
