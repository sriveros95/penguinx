// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;

//  ==========  External imports    ==========

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/MulticallUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

//  ==========  thirdweb imports    ==========

import "@thirdweb-dev/contracts/contracts/openzeppelin-presets/metatx/ERC2771ContextUpgradeable.sol";

import "@thirdweb-dev/contracts/contracts/lib/CurrencyTransferLib.sol";
import "@thirdweb-dev/contracts/contracts/lib/FeeType.sol";

//  ==========  Internal imports    ==========
import {IPenguinXMarketplace} from "../interfaces/IPenguinXMarketplace.sol";
import "./PenguinXNFT.sol";

contract PenguinXMarketPlace is
    Initializable,
    IPenguinXMarketplace,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable,
    MulticallUpgradeable,
    AccessControlEnumerableUpgradeable,
    IERC721ReceiverUpgradeable,
    IERC1155ReceiverUpgradeable
{

    using CountersUpgradeable for CountersUpgradeable.Counter;
    /*///////////////////////////////////////////////////////////////
                            State variables
    //////////////////////////////////////////////////////////////*/

    bytes32 private constant MODULE_TYPE = bytes32("PenguinXMarketplace");
    uint256 private constant VERSION = 1;

    address USDC_TOKEN_ADDRESS = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // Polygon
    // address USDC_TOKEN_ADDRESS = 0xEEa85fdf0b05D1E0107A61b4b4DB1f345854B952;         // Goerli

    /// @dev The address of PenguinXMaster.
    address public immutable PENGUIN_X_MASTER;

    /// @dev The address of the PenguinXNFT in use.
    address public PENGUIN_X_NFT;

    /// @dev Only lister role holders can create listings, when listings are restricted by lister address.
    bytes32 private constant LISTER_ROLE = keccak256("LISTER_ROLE");
    /// @dev Only assets from NFT contracts with asset role can be listed, when listings are restricted by asset address.
    bytes32 private constant ASSET_ROLE = keccak256("ASSET_ROLE");

    /// @dev The address of the native token wrapper contract.
    address private immutable nativeTokenWrapper;

    /// @dev Total number of listing requests ever created in the marketplace.
    CountersUpgradeable.Counter public totalListingRequests;

    /// @dev Total number of listings ever created in the marketplace.
    CountersUpgradeable.Counter public totalListings;

    /// @dev Contract level metadata.
    string public contractURI;

    /// @dev The address that receives all platform fees from all sales.
    // address private platformFeeRecipient;

    /// @dev The max bps of the contract. So, 10_000 == 100 %
    uint64 public constant MAX_BPS = 10_000;

    /// @dev The % of primary sales collected as platform fees.
    // uint64 private platformFeeBps;

    /*///////////////////////////////////////////////////////////////
                                Mappings
    //////////////////////////////////////////////////////////////*/

    // Authorized Penguin X Verifiers
    mapping(address => bool) public authorized_verifiers;

    mapping(uint256 => DeliveryData) private delivery_data; // Encrypted data where to deliver

    /// @dev Mapping from uid of listing request => listing request info.
    mapping(uint256 => ListingRequest) public listing_requests;

    /// @dev Mapping from uid of listing => listing info.
    mapping(uint256 => Listing) public listings;

    // /// @dev Mapping from uid of a direct listing => offeror address => offer made to the direct listing by the respective offeror.
    // mapping(uint256 => mapping(address => Offer)) public offers;

    // ListingStatus
    // 0: N/A
    // 1: Verification Removed
    // 2: Delisted by seller
    // 3: Delisted by Penguin
    // 4: Bought, Delivery Verification Failed, Escrow Returned
    // 10: Listed (Verified)
    // 20: Bought (Payment Escrowed)*
    // 29: Bought, Delivery Verification Failed (Need to solve before escrow returned)
    // 30: Delivery In Progress (Marked by Seller)
    // 31: Delivery In Progress Verified
    // 32: Delivery was verified but Failed
    // 42: Delivery Succeeded
    mapping(uint256 => uint256) public status;

    /*///////////////////////////////////////////////////////////////
                                Modifiers
    //////////////////////////////////////////////////////////////*/

    /// @dev Checks whether caller is a listing creator.
    modifier onlyListingCreator(uint256 _listing_id) {
        require(listings[_listing_id].tokenOwner == _msgSender(), "!OWNER");
        _;
    }

    /// @dev Checks whether a listing exists.
    modifier onlyExistingListing(uint256 _listing_id) {
        require(listings[_listing_id].assetContract != address(0), "DNE");
        _;
    }

    /*///////////////////////////////////////////////////////////////
                    Constructor + initializer logic
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _nativeTokenWrapper,
        address _defaultAdmin,
        string memory _contractURI,
        address[] memory _trustedForwarders
        // address _platformFeeRecipient,
        // uint256 _platformFeeBps
    ) initializer {
        nativeTokenWrapper = _nativeTokenWrapper;
        PENGUIN_X_MASTER = _defaultAdmin;

        // Initialize inherited contracts, most base-like -> most derived.
        __ReentrancyGuard_init();
        __ERC2771Context_init(_trustedForwarders);

        // Initialize this contract's state.
        // timeBuffer = 15 minutes;
        // bidBufferBps = 500;

        contractURI = _contractURI;
        // platformFeeBps = uint64(_platformFeeBps);
        // platformFeeRecipient = _platformFeeRecipient;

        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _setupRole(LISTER_ROLE, address(0));
        _setupRole(ASSET_ROLE, address(0));
    }

    /*///////////////////////////////////////////////////////////////
                        Generic contract logic
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets the contract receives native tokens from `nativeTokenWrapper` withdraw.
    receive() external payable {}

    /// @dev Returns the type of the contract.
    function contractType() external pure returns (bytes32) {
        return MODULE_TYPE;
    }

    /// @dev Returns the version of the contract.
    function contractVersion() external pure returns (uint8) {
        return uint8(VERSION);
    }

    /*///////////////////////////////////////////////////////////////
                        ERC 165 / 721 / 1155 logic
    //////////////////////////////////////////////////////////////*/

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerableUpgradeable, IERC165Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155ReceiverUpgradeable).interfaceId ||
            interfaceId == type(IERC721ReceiverUpgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /*///////////////////////////////////////////////////////////////
                Listing (create-update-delete) logic
    //////////////////////////////////////////////////////////////*/

    function setVerifier(address verifier, bool is_authorized)
        public
    {
        require(msg.sender == PENGUIN_X_MASTER, "NOT_MASTER");
        authorized_verifiers[verifier] = is_authorized;
    }

    function isVerifier(address verifier) public view returns (bool) {
        return authorized_verifiers[verifier];
    }

    /// @dev Lets a token owner create a request to list tokens for sale: Direct Listing or Auction.
    function createListingRequest(
        string memory _name,
        string memory _description,
        string memory _base_uri,
        uint256 _price
    ) external override returns (address nft_addr) {
        ListingRequest memory _new_listing = ListingRequest({
            owner: msg.sender,
            name: _name,
            description: _description,
            base_uri: _base_uri,
            price: _price
        });
        
        listing_requests[totalListingRequests.current()] = _new_listing;
        emit NewListingRequest(totalListingRequests.current(), msg.sender);

        totalListingRequests.increment();
        return nft_addr;
    }

    /// @dev Lets a verifier create a listing of a verified Penguin X NFT (cool stuff) providing the listing request id and how many seconds will the listing be active
    function createListing(uint256 _listing_request_id, uint256[] memory _delivery_prices, uint256 _valid_for_seconds) external override returns (uint256) {
        // start PenguinX mod

        // Check its a verifier who is calling
        require(
            isVerifier(msg.sender),
            "NOT_VERIFIER"
        );

        // end  PenguinX mod
        uint256 _listing_id = totalListings.current();
        address tokenOwner = listing_requests[_listing_request_id].owner;
        TokenType tokenTypeOfListing = TokenType.ERC721;
        // uint256 tokenAmountToList = getSafeQuantity(tokenTypeOfListing, 1);

        // require(tokenAmountToList > 0, "QUANTITY");
        require(
            hasRole(LISTER_ROLE, address(0)) ||
                hasRole(LISTER_ROLE, _msgSender()),
            "!LISTER"
        );
        require(
            hasRole(ASSET_ROLE, address(0)) ||
                hasRole(ASSET_ROLE, PENGUIN_X_NFT),
            "!ASSET"
        );

        // Mark Listed (Verified)
        status[_listing_id] = 10;

        // Mint Penguin X NFT
        PenguinXNFT(PENGUIN_X_NFT).x_mint(
            msg.sender,         // Verifier
            _delivery_prices,
            listing_requests[_listing_request_id].name,
            listing_requests[_listing_request_id].description,
            listing_requests[_listing_request_id].base_uri,
            listing_requests[_listing_request_id].owner,
            _listing_id
        );

        // uint256 startTime = _params.startTime;
        uint256 startTime = block.timestamp;

        if (startTime < block.timestamp) {
            // do not allow listing to start in the past (1 hour buffer)
            require(block.timestamp - startTime < 1 hours, "ST");
            startTime = block.timestamp;
        }

        uint256 price = listing_requests[_listing_request_id].price;

        Listing memory newListing = Listing({
            listingId: _listing_id,
            tokenOwner: tokenOwner,
            tokenBuyer: address(0),
            assetContract: PENGUIN_X_NFT,
            tokenId: _listing_id,
            startTime: startTime,
            endTime: startTime + _valid_for_seconds,
            quantity: 1,
            currency: USDC_TOKEN_ADDRESS,
            reservePricePerToken: price,
            buyoutPricePerToken: price,
            escrowed: 0,
            tokenType: tokenTypeOfListing,
            listingType: ListingType.Direct
        });

        listings[_listing_id] = newListing;

        emit ListingAdded(_listing_id, PENGUIN_X_NFT, tokenOwner, newListing);

        totalListings.increment();
        return _listing_id;
    }

    function getListingRequest(uint256 _listing_id)
        external
        view
        override
        returns (ListingRequest memory)
    {
        return listing_requests[_listing_id];
    }

    function addTrackingCode(uint256 _listing_id, bytes memory _tracking_code, bytes memory _delivery_proof)
        external
    {
        require(listings[_listing_id].tokenOwner == msg.sender, "!OWNER");
        require(listings[_listing_id].escrowed != 0, "!ESCROWED");
        require(status[_listing_id] == 20, "ATC_NOT_ALLOWED");
        
        DeliveryData memory targetData = delivery_data[_listing_id];
        targetData.tracking_code = _tracking_code;
        targetData.delivery_proof = _delivery_proof;

        status[_listing_id] = 30; // Delivery In Progress (Marked by Seller)
        delivery_data[_listing_id] = targetData;
    }

    /// @dev Lets a listing's creator edit the listing's parameters.
    function updateListing(
        uint256 _listing_id,
        uint256 _quantityToList,
        uint256 _reservePricePerToken,
        uint256 _buyoutPricePerToken,
        address _currencyToAccept,
        uint256 _startTime,
        uint256 _secondsUntilEndTime
    ) external override onlyListingCreator(_listing_id) {
        // do not allow modifying if escrow is open
        require(listings[_listing_id].escrowed == 0, "UL_ESCROWED");
        require(listings[_listing_id].tokenBuyer == address(0), "UL_BOUGHT");

        Listing memory targetListing = listings[_listing_id];
        // uint256 safeNewQuantity = getSafeQuantity(
        //     targetListing.tokenType,
        //     _quantityToList
        // );
        // require(safeNewQuantity != 0, "UL_QUANTITY");

        if (_startTime < block.timestamp) {
            // do not allow listing to start in the past (1 hour buffer)
            require(block.timestamp - _startTime < 1 hours, "UL_ST");
            _startTime = block.timestamp;
        }

        uint256 newStartTime = _startTime == 0
            ? targetListing.startTime
            : _startTime;
        listings[_listing_id] = Listing({
            listingId: _listing_id,
            tokenOwner: _msgSender(),
            tokenBuyer: address(0),
            assetContract: targetListing.assetContract,
            tokenId: targetListing.tokenId,
            startTime: newStartTime,
            endTime: _secondsUntilEndTime == 0
                ? targetListing.endTime
                : newStartTime + _secondsUntilEndTime,
            quantity: 1,
            currency: _currencyToAccept,
            reservePricePerToken: _reservePricePerToken,
            buyoutPricePerToken: _buyoutPricePerToken,
            tokenType: targetListing.tokenType,
            listingType: targetListing.listingType,
            escrowed: targetListing.escrowed
        });

        // Must validate ownership and approval of the new quantity of tokens for direct listing.
        if (targetListing.quantity != 1) {
            validateOwnershipAndApproval(
                targetListing.tokenOwner,
                targetListing.assetContract,
                targetListing.tokenId,
                1,
                targetListing.tokenType
            );
        }

        emit ListingUpdated(_listing_id, targetListing.tokenOwner);
    }

    /// @dev Lets a direct listing creator cancel their listing.
    function cancelDirectListing(uint256 _listing_id)
        external
        onlyListingCreator(_listing_id)
    {
        // do not allow modifying if escrow is open
        require(listings[_listing_id].escrowed == 0, "ESCROWED");

        // Burn nft if minted
        if (status[_listing_id] >= 10){
            PenguinXNFT(listings[_listing_id].assetContract).transfer(_listing_id, address(0));
        }

        if (listings[_listing_id].tokenOwner == msg.sender) {
            status[_listing_id] = 2; // Delisted by seller
        }else if (listings[_listing_id].tokenOwner == msg.sender) {
            status[_listing_id] = 3; // Delisted by Penguin
        }else{
            revert("DL_NOT_AUTHORIZED");
        }

        Listing memory targetListing = listings[_listing_id];

        require(targetListing.listingType == ListingType.Direct, "!DIRECT");

        delete listings[_listing_id];

        emit ListingRemoved(_listing_id, targetListing.tokenOwner);
    }

    /*///////////////////////////////////////////////////////////////
                    Direct lisitngs sales logic
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets an account buy a given quantity of tokens from a listing.
    function buy(
        uint256 _listing_id,
        address _buyFor,
        uint256 _quantityToBuy,
        address _currency,
        uint256 _totalPrice,
        DeliveryData memory _deliveryData
    ) external payable override nonReentrant onlyExistingListing(_listing_id) {
        require(status[_listing_id] == 10, "BUY_NOT_LISTED");
        
        Listing memory targetListing = listings[_listing_id];
        address payer = _msgSender();

        uint256 deliveryPrice = PenguinXNFT(targetListing.assetContract)
            .getDeliveryPrice(_listing_id, _deliveryData.zone);

        // Check whether the settled total price and currency to use are correct.
        require(
            _currency == targetListing.currency && _totalPrice == (deliveryPrice + targetListing.reservePricePerToken),
            "!PRICE"
        );

        executeSale(
            targetListing,
            payer,
            _buyFor,
            targetListing.currency,
            targetListing.reservePricePerToken + deliveryPrice,
            _quantityToBuy,
            _deliveryData
        );
    }

    // /// @dev Lets a listing's creator accept an offer for their direct listing.
    // function acceptOffer(
    //     uint256 _listing_id,
    //     address _offeror,
    //     address _currency,
    //     uint256 _pricePerToken
    // )
    //     external
    //     override
    //     nonReentrant
    //     onlyListingCreator(_listing_id)
    //     onlyExistingListing(_listing_id)
    // {
    //     Offer memory targetOffer = offers[_listing_id][_offeror];
    //     Listing memory targetListing = listings[_listing_id];

    //     require(
    //         _currency == targetOffer.currency &&
    //             _pricePerToken == targetOffer.pricePerToken,
    //         "!PRICE"
    //     );
    //     require(targetOffer.expirationTimestamp > block.timestamp, "EXPIRED");

    //     delete offers[_listing_id][_offeror];

    //     executeSale(
    //         targetListing,
    //         _offeror,
    //         _offeror,
    //         targetOffer.currency,
    //         targetOffer.pricePerToken * targetOffer.quantityWanted,
    //         targetOffer.quantityWanted,
    //         "", // TODO CORRECT THIS
    //         0 // TODO CORRECT THIS
    //     );
    // }

    /// @dev Performs a direct listing sale.
    /// Verifies payment amount, escrows payment and NFT
    function executeSale(
        Listing memory _targetListing,
        address _payer,
        address _receiver,
        address _currency,
        uint256 _currencyAmountToTransfer,
        uint256 _listingTokenAmountToTransfer,
        DeliveryData memory _deliveryData
    ) internal {
        validateDirectListingSale(
            _targetListing,
            _payer,
            _listingTokenAmountToTransfer,
            _currency,
            _currencyAmountToTransfer
        );

        _targetListing.quantity -= _listingTokenAmountToTransfer;

        // Record delivery data
        delivery_data[_targetListing.listingId] = _deliveryData;

        // Escrow
        CurrencyTransferLib.transferCurrencyWithWrapper(
            _currency,
            _payer,
            address(this),
            _currencyAmountToTransfer,
            nativeTokenWrapper
        );
        _targetListing.escrowed += _currencyAmountToTransfer;
        _targetListing.tokenBuyer = msg.sender;

        listings[_targetListing.listingId] = _targetListing;

        status[_targetListing.listingId] = 20; // Bought (Payment Escrowed)

        // Escrows the NFT
        PenguinXNFT(_targetListing.assetContract).buy(
            _targetListing.listingId
        );

        emit NewSale(
            _targetListing.listingId,
            _targetListing.assetContract,
            _targetListing.tokenOwner,
            _receiver,
            _listingTokenAmountToTransfer,
            _currencyAmountToTransfer
        );
    }

    /// @dev Performs a direct listing sale.
    function executePayout(
        Listing memory _targetListing,
        address _receiver,
        address _currency,
        uint256 _currencyAmountToTransfer
    ) internal {
        // TODO CHECK
        
        require(
            _currencyAmountToTransfer <=
                listings[_targetListing.listingId].escrowed,
            "NOT_ESCROWED"
        );

        IERC20Upgradeable(_currency).transfer(
            _receiver,
            _currencyAmountToTransfer
        );
    }

    function getDeliveryData(uint256 _listing_id) public view returns (DeliveryData memory) {
        Listing memory targetListing = listings[_listing_id];
        require(
            targetListing.tokenOwner == msg.sender || targetListing.tokenBuyer == msg.sender || isVerifier(msg.sender),
            "MP_GDI_NOT_ALLOWED"
        );
        return (delivery_data[_listing_id]);
    }

    function verifyDeliveryStatus(uint256 _listing_id, uint256 _status) external {
        require(isVerifier(msg.sender), "VDS_NOT_VERIFIER");

        Listing memory targetListing = listings[_listing_id];

        // If Delivery In Progress Verified
        if (_status == 31) {
            require(status[_listing_id] == 30 || status[_listing_id] == 29, "VDS_NOT_29_OR_30");
            // Pay escrow to seller
            executePayout(
                targetListing,
                targetListing.tokenOwner,
                USDC_TOKEN_ADDRESS,
                listings[_listing_id].escrowed
            );

            // Transfer NFT to buyer
            PenguinXNFT(targetListing.assetContract).transfer(_listing_id, targetListing.tokenBuyer);
        } else if (_status == 4){
            // Bought, Delivery Verification Failed, Escrow Returned
            require(status[_listing_id] == 29, "VDS_NOT_29");

            // Return escrow to buyer
            executePayout(
                targetListing,
                targetListing.tokenBuyer,
                USDC_TOKEN_ADDRESS,
                listings[_listing_id].escrowed
            );

            // Burn NFT
            PenguinXNFT(targetListing.assetContract).transfer(_listing_id, address(0));
        } else if (_status == 29) {
            // Delivery Verification Failed
            // Escrow will not be returned immediatly allowing seller to correct
            require(status[_listing_id] == 30, "VDS_NOT_30");
        } else if (_status == 42 || _status == 32) {
            require(status[_listing_id] == 30, "VDS_NOT_31");
        }else{
            revert("VDS_INVALID");
        }
        status[_listing_id] = _status;
    }


    /*///////////////////////////////////////////////////////////////
                        Offer/bid logic
    //////////////////////////////////////////////////////////////*/

    // /// @dev Lets an account (1) make an offer to a direct listing, or (2) make a bid in an auction.
    // function offer(
    //     uint256 _listing_id,
    //     uint256 _quantityWanted,
    //     address _currency,
    //     uint256 _pricePerToken,
    //     uint256 _expirationTimestamp
    // ) external payable override nonReentrant onlyExistingListing(_listing_id) {
    //     Listing memory targetListing = listings[_listing_id];

    //     require(
    //         targetListing.endTime > block.timestamp &&
    //             targetListing.startTime < block.timestamp,
    //         "inactive listing."
    //     );

    //     // Both - (1) offers to direct listings, and (2) bids to auctions - share the same structure.
    //     Offer memory newOffer = Offer({
    //         listingId: _listing_id,
    //         offeror: _msgSender(),
    //         quantityWanted: _quantityWanted,
    //         currency: _currency,
    //         pricePerToken: _pricePerToken,
    //         expirationTimestamp: _expirationTimestamp
    //     });

    //     // Prevent potentially lost/locked native token.
    //     require(msg.value == 0, "no value needed");

    //     // Offers to direct listings cannot be made directly in native tokens.
    //     newOffer.currency = _currency == CurrencyTransferLib.NATIVE_TOKEN
    //         ? nativeTokenWrapper
    //         : _currency;
    //     newOffer.quantityWanted = getSafeQuantity(
    //         targetListing.tokenType,
    //         _quantityWanted
    //     );

    //     handleOffer(targetListing, newOffer);
    // }

    // /// @dev Processes a new offer to a direct listing.
    // function handleOffer(Listing memory _targetListing, Offer memory _newOffer)
    //     internal
    // {
    //     require(
    //         _newOffer.quantityWanted <= _targetListing.quantity &&
    //             _targetListing.quantity > 0,
    //         "insufficient tokens in listing."
    //     );

    //     validateERC20BalAndAllowance(
    //         _newOffer.offeror,
    //         _newOffer.currency,
    //         _newOffer.pricePerToken * _newOffer.quantityWanted
    //     );

    //     offers[_targetListing.listingId][_newOffer.offeror] = _newOffer;

    //     emit NewOffer(
    //         _targetListing.listingId,
    //         _newOffer.offeror,
    //         _targetListing.listingType,
    //         _newOffer.quantityWanted,
    //         _newOffer.pricePerToken * _newOffer.quantityWanted,
    //         _newOffer.currency
    //     );
    // }

    /*///////////////////////////////////////////////////////////////
            Shared (direct+auction listings) internal functions
    //////////////////////////////////////////////////////////////*/

    // /// @dev Pays out stakeholders in a sale.
    // function payout(
    //     address _payer,
    //     address _payee,
    //     address _currencyToUse,
    //     uint256 _totalPayoutAmount,
    //     Listing memory _listing
    // ) internal {
    //     uint256 platformFeeCut = (_totalPayoutAmount * platformFeeBps) /
    //         MAX_BPS;

    //     uint256 royaltyCut;
    //     // address royaltyRecipient;

    //     // // Distribute royalties. See Sushiswap's https://github.com/sushiswap/shoyu/blob/master/contracts/base/BaseExchange.sol#L296
    //     // try
    //     //     IERC2981Upgradeable(_listing.assetContract).royaltyInfo(
    //     //         _listing.tokenId,
    //     //         _totalPayoutAmount
    //     //     )
    //     // returns (address royaltyFeeRecipient, uint256 royaltyFeeAmount) {
    //     //     if (royaltyFeeRecipient != address(0) && royaltyFeeAmount > 0) {
    //     //         require(
    //     //             royaltyFeeAmount + platformFeeCut <= _totalPayoutAmount,
    //     //             "fees exceed the price"
    //     //         );
    //     //         royaltyRecipient = royaltyFeeRecipient;
    //     //         royaltyCut = royaltyFeeAmount;
    //     //     }
    //     // } catch {}

    //     // Distribute price to token owner
    //     address _nativeTokenWrapper = nativeTokenWrapper;

    //     CurrencyTransferLib.transferCurrencyWithWrapper(
    //         _currencyToUse,
    //         _payer,
    //         platformFeeRecipient,
    //         platformFeeCut,
    //         _nativeTokenWrapper
    //     );
    //     // CurrencyTransferLib.transferCurrencyWithWrapper(
    //     //     _currencyToUse,
    //     //     _payer,
    //     //     royaltyRecipient,
    //     //     royaltyCut,
    //     //     _nativeTokenWrapper
    //     // );
    //     CurrencyTransferLib.transferCurrencyWithWrapper(
    //         _currencyToUse,
    //         _payer,
    //         _payee,
    //         _totalPayoutAmount - (platformFeeCut + royaltyCut),
    //         _nativeTokenWrapper
    //     );
    // }

    /// @dev Validates that `_addrToCheck` owns and has approved markeplace to transfer the appropriate amount of currency
    function validateERC20BalAndAllowance(
        address _addrToCheck,
        address _currency,
        uint256 _currencyAmountToCheckAgainst
    ) internal view {
        require(
            IERC20Upgradeable(_currency).balanceOf(_addrToCheck) >=
                _currencyAmountToCheckAgainst &&
                IERC20Upgradeable(_currency).allowance(
                    _addrToCheck,
                    address(this)
                ) >=
                _currencyAmountToCheckAgainst,
            "!BAL20"
        );
    }

    /// @dev Validates that `_tokenOwner` owns and has approved Market to transfer NFTs.
    function validateOwnershipAndApproval(
        address _tokenOwner,
        address _assetContract,
        uint256 _tokenId,
        uint256 _quantity,
        TokenType _tokenType
    ) internal view {
        address market = address(this);
        bool isValid;

        if (_tokenType == TokenType.ERC1155) {
            isValid =
                IERC1155Upgradeable(_assetContract).balanceOf(
                    _tokenOwner,
                    _tokenId
                ) >=
                _quantity &&
                IERC1155Upgradeable(_assetContract).isApprovedForAll(
                    _tokenOwner,
                    market
                );
        } else if (_tokenType == TokenType.ERC721) {
            isValid =
                IERC721Upgradeable(_assetContract).ownerOf(_tokenId) ==
                _tokenOwner &&
                (IERC721Upgradeable(_assetContract).getApproved(_tokenId) ==
                    market ||
                    IERC721Upgradeable(_assetContract).isApprovedForAll(
                        _tokenOwner,
                        market
                    ));
        }

        require(isValid, "!BALNFT");
    }

    /// @dev Validates conditions of a direct listing sale.
    function validateDirectListingSale(
        Listing memory _listing,
        address _payer,
        uint256 _quantityToBuy,
        address _currency,
        uint256 settledTotalPrice
    ) internal {
        require(
            _listing.listingType == ListingType.Direct,
            "cannot buy from listing."
        );

        // Check whether a valid quantity of listed tokens is being bought.
        require(
            _listing.quantity > 0 &&
                _quantityToBuy > 0 &&
                _quantityToBuy <= _listing.quantity,
            "invalid amount of tokens."
        );

        // Check if sale is made within the listing window.
        require(
            block.timestamp < _listing.endTime &&
                block.timestamp > _listing.startTime,
            "not within sale window."
        );

        // Check: buyer owns and has approved sufficient currency for sale.
        if (_currency == CurrencyTransferLib.NATIVE_TOKEN) {
            require(msg.value == settledTotalPrice, "msg.value != price");
        } else {
            validateERC20BalAndAllowance(_payer, _currency, settledTotalPrice);
        }

        // Check whether token owner owns and has approved `quantityToBuy` amount of listing tokens from the listing.
        validateOwnershipAndApproval(
            _listing.tokenOwner,
            _listing.assetContract,
            _listing.tokenId,
            _quantityToBuy,
            _listing.tokenType
        );
    }

    /*///////////////////////////////////////////////////////////////
                            Getter functions
    //////////////////////////////////////////////////////////////*/

    /// @dev Enforces quantity == 1 if tokenType is TokenType.ERC721.
    // function getSafeQuantity(TokenType _tokenType, uint256 _quantityToCheck)
    //     internal
    //     pure
    //     returns (uint256 safeQuantity)
    // {
    //     if (_quantityToCheck == 0) {
    //         safeQuantity = 0;
    //     } else {
    //         safeQuantity = _tokenType == TokenType.ERC721
    //             ? 1
    //             : _quantityToCheck;
    //     }
    // }

    // /// @dev Returns the platform fee recipient and bps.
    // function getPlatformFeeInfo() external view returns (address, uint16) {
    //     return (platformFeeRecipient, uint16(platformFeeBps));
    // }

    // /*///////////////////////////////////////////////////////////////
    //                         Setter functions
    // //////////////////////////////////////////////////////////////*/

    // /// @dev Lets a contract admin update platform fee recipient and bps.
    // function setPlatformFeeInfo(
    //     address _platformFeeRecipient,
    //     uint256 _platformFeeBps
    // ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    //     require(_platformFeeBps <= MAX_BPS, "bps <= 10000.");

    //     platformFeeBps = uint64(_platformFeeBps);
    //     platformFeeRecipient = _platformFeeRecipient;

    //     emit PlatformFeeInfoUpdated(_platformFeeRecipient, _platformFeeBps);
    // }

    /// @dev Lets a contract admin set the URI for the contract-level metadata.
    function setContractURI(string calldata _uri)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        contractURI = _uri;
    }

    /// @dev Lets a contract admin set the Penguin X NFT address in use.
    function setPenguinXNFT(address _penguin_x_nft) external {
        require(msg.sender == PENGUIN_X_MASTER, "NOT_MASTER");
        PENGUIN_X_NFT = _penguin_x_nft;
    }

    /*///////////////////////////////////////////////////////////////
                            Miscellaneous
    //////////////////////////////////////////////////////////////*/

    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }
}
