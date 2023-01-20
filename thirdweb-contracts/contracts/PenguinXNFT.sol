pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract PenguinXNFT is ERC721URIStorage {
    address public PENGUIN_X_MARKETPLACE;
    
    mapping(uint256 => string) public name;
    mapping(uint256 => string) public description;
    mapping(uint256 => address) public verifier;                                // If set means it has been verified
    mapping(uint256 => mapping(uint256 => uint256)) public delivery_prices;     // 0 N/A  1: Colombia  2: US  3: Canada
    
    string public constant version = "0.2";                 // PenguinX Version

    constructor(
        string memory _name,
        address _penguin_x_marketplace
    ) public ERC721(_name, "PGX") {
        PENGUIN_X_MARKETPLACE = _penguin_x_marketplace;
    }

    function getDeliveryPrice(uint256 _token_id, uint256  _delivery_zone) public view returns (uint256) {
        return delivery_prices[_token_id][_delivery_zone];
    }

    function transfer(uint256 _token_id, address to) public {
        require(msg.sender == PENGUIN_X_MARKETPLACE, "TF_NOT_MARKETPLACE");

        if (to == address(0)) {
            _burn(_token_id);
        }else{
            _transfer(ownerOf(_token_id), to, _token_id);
        }
    }
    
    function x_mint(
        address _verifier,
        uint256[] memory _delivery_prices,
        string memory _name,
        string memory _description,
        string memory _tokenURI,
        address _owner,
        uint256 _token_id
    ) public {
        require(msg.sender == PENGUIN_X_MARKETPLACE, "MT_NOT_MARKETPLACE");

        name[_token_id] = _name;
        description[_token_id] = _description;
        verifier[_token_id] = _verifier;
        for (uint256 index = 0; index < _delivery_prices.length; index++) {
            delivery_prices[_token_id][index] = _delivery_prices[index];
        }

        _mint(_owner, _token_id);
        _setTokenURI(_token_id, _tokenURI);
        _approve(PENGUIN_X_MARKETPLACE, _token_id); // Approve marketplace to transfer
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

    function buy(uint256 _token_id) public {
        require(msg.sender == PENGUIN_X_MARKETPLACE, 'BUY_NOT_MARKETPLACE');
        _transfer(ownerOf(_token_id), PENGUIN_X_MARKETPLACE, _token_id);
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
