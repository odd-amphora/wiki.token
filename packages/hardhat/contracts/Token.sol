// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

/// @author The Wiki Token team
/// @title Wiki Token ERC 721 contract
/// TODO(teddywilson) Figure out Wikipedia distribution mechanism
contract Token is ERC721, Ownable {
    /// Minted page ids in order, used for pagination
    uint256[] private _mintedPageIds;

    /// Maps an address to the page ids they own
    mapping (address => uint256[]) private _addressToPageIds;

    /// Maps an address to the number of pages they own
    mapping (address => uint256) public balanceOf;

    /// Maps a page id to an address
    mapping (uint256 => address) public pageIdToAddress;

    /// Maps a page id to its outstanding offer by the seller
    mapping (uint256 => Offer) public pagesOfferedForSale;

    /// Maps a page id to the highest outstanding offer
    mapping (uint256 => Bid) public pageBids;

    /// Pending funds to be withdrawn for each address
    mapping (address => uint) public pendingWithdrawals;

    struct Offer {
        bool isForSale;
        uint pageId;
        address seller;
        uint minValue; // in ether
    }

    struct Bid {
        bool hasBid;
        uint pageId;
        address bidder;
        uint value;
    }

    event Assign(address indexed to, uint256 pageId);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event PageTransfer(address indexed from, address indexed to, uint256 pageId);
    event PageOffered(uint indexed pageId, uint minValue);
    event PageBidEntered(uint indexed pageId, uint value, address indexed fromAddress);
    event PageBidWithdrawn(uint indexed pageId, uint value, address indexed fromAddress);
    event PageBought(uint indexed pageId, uint value, address indexed fromAddress, address indexed toAddress);
    event PageNoLongerForSale(uint indexed pageId);    

    /// Wiki Token constructor
    /// @param baseURI the base URI that will be applied to all tokens
    constructor (string memory baseURI) public ERC721("WikiToken", "WIKI") {
        _setBaseURI(baseURI);
    }

    /// Sets base URI for tokens
    /// @param baseURI base URI that will be set
    function setBaseURI(string memory baseURI) public onlyOwner {
        _setBaseURI(baseURI);
    }

    /// Check if token for `pageId` is claimed
    /// @param pageId unique id of token in question
    /// @return true if claimed, false otherwise
    function isClaimed(uint256 pageId) public view returns (bool) {
        return _exists(pageId);
    }

    /// Paginates items in a uint256 array
    /// @param cursor position to start at
    /// @param howMany max number of items to return
    /// @param ascending index array in ascending/descending order
    /// @param array data that will be indexed
    /// @dev uint256 array type could be templated once solidity supports this
    function _paginate(
        uint256 cursor,
        uint256 howMany,
        bool ascending,
        uint256[] storage array
    ) private view returns (uint256[] memory result, uint256 newCursor, bool reachedEnd) {
        require (
            cursor < array.length,
            "Cursor position out of bounds"
        );
        uint cursor_ = cursor;
        uint256 length = Math.min(howMany, array.length - cursor);
        uint256 cursorInternal = ascending
            ? cursor
            : array.length - 1 - cursor;
        result = new uint256[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = array[cursorInternal];
            if (ascending) {
                cursorInternal++;
            } else {
                cursorInternal--;
            }
            cursor_++;
        }
        return (result, cursor_, cursor == array.length);
    }

    /// Fetches tokens belonging to any address
    /// @param cursor the index results should start at
    /// @param howMany how many results should be returned
    function discover(
        uint256 cursor,
        uint256 howMany,
        bool ascending
    ) public view returns (uint256[] memory result, uint256 newCursor, bool reachedEnd) {
        return _paginate(cursor, howMany, ascending, _mintedPageIds);
    }

    /// Fetches tokens of an address
    /// @param address_ address that tokens will be queried for
    /// @param cursor the index results should start at
    /// @param howMany how many results should be returned
    /// @dev `cursor` and `howMany` allow us to paginate results
    function tokensOf(
        address address_,
        uint256 cursor,
        uint256 howMany,
        bool ascending
    ) public view returns (uint256[] memory result, uint256 newCursor, bool reachedEnd) {
        return _paginate(cursor, howMany, ascending, _addressToPageIds[address_]);
    }

    /// Mints a Wiki Token
    /// @param pageId Wikipedia page (by id) that will be minted as a token
    function mint(uint256 pageId) public {
        _mint(msg.sender, pageId);
        _setTokenURI(pageId, Strings.toString(pageId));

        _addressToPageIds[msg.sender].push(pageId);
        _mintedPageIds.push(pageId);
    
    }

    /// TODO: this is just like mint, consolidate
    function claimPage(uint pageId) {
        if (pageIdToAddress[pageId] != 0x0) throw;
        pageIdToAddress[pageId] = msg.sender;
        balanceOf[msg.sender]++;
        Assign(msg.sender, pageId);
    }

    /// Transfer ownership of a page to another user without requiring payment
    /// @param address Address the page will be transferred to
    /// @param pageId ID of the page that will be transferred
    function transferPage(address to, uint256 pageId) {
        if (pageIdToAddress[pageId] != msg.sender) throw;
        if (pagesOfferedForSale[pageId].isForSale) {
            pageNoLongerForSale(pageId);
        }
        pageIdToAddress[pageId] = to;
        balanceOf[msg.sender]--;
        balanceOf[to]++;
        Transfer(msg.sender, to, 1);
        PageTransfer(msg.sender, to, pageId);
        // Check for the case where there is a bid from the new owner and refund it.
        // Any other bid can stay in place.
        Bid bid = pageBids[pageId];
        if (bid.bidder == to) {
            // Kill bid and refund value
            pendingWithdrawals[to] += bid.value;
            pageBids[pageId] = Bid(false, pageId, 0x0, 0);
        }
    }

    /// Allows a seller to indicate that a page they own is no longer for sale
    /// @param pageId ID of the page that the seller is taking off the market
    function pageNoLongerForSale(uint256 pageId) {
        if (pageIdToAddress[pageId] != msg.sender) throw;
        pagesOfferedForSale[pageId] = Offer(false, pageId, msg.sender, 0);
        PageNoLongerForSale(pageId);
    }

    /// Allows a seller to indicate that that a page they own is up for purchase
    /// @param pageId ID of they page that the seller is putting on the market
    /// @param minSalePriceInWei Minimum sale price the seller will accept for the page
    function offerPageForSale(uint256 pageId, uint minSalePriceInWei) {
        if (pageIdToAddress[pageId] != msg.sender) throw;
        pagesOfferedForSale[pageId] = Offer(true, pageId, msg.sender, minSalePriceInWei);
        PageOffered(pageId, minSalePriceInWei, 0x0);
    }

    /// Purchases a page for the full offer price (or more)
    /// @param pageId ID of the page being purchased.
    function buyPage(uint pageId) payable {
        Offer offer = pagesOfferedForSale[pageId];
        if (!offer.isForSale) throw;
        if (offer.onlySellTo != 0x0 && offer.onlySellTo != msg.sender) throw;
        if (msg.value < offer.minValue) throw;
        if (offer.seller != pageIdToAddress[pageId]) throw;

        address seller = offer.seller;

        pageIdToAddress[pageId] = msg.sender;
        balanceOf[seller]--;
        balanceOf[msg.sender]++;
        Transfer(seller, msg.sender, 1);

        pageNoLongerForSale(pageId);
        pendingWithdrawals[seller] += msg.value;
        PageBought(pageId, msg.value, seller, msg.sender);

        // Check for the case where there is a bid from the new owner and refund it.
        // Any other bid can stay in place.
        Bid bid = pageBids[pageId];
        if (bid.bidder == msg.sender) {
            // Kill bid and refund value
            pendingWithdrawals[msg.sender] += bid.value;
            pageBids[pageId] = Bid(false, pageId, 0x0, 0);
        }
    }

    /// Withdraw pending funds
    function withdraw() {
        uint amount = pendingWithdrawals[msg.sender];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    /// Places a purchasing bid on a page
    /// @param pageId ID of the page will be placed on
    function enterBidForPage(uint256 pageId) payable {
        if (pageIdToAddress[pageId] == 0x0) throw;
        if (pageIdToAddress[pageId] == msg.sender) throw;
        if (msg.value == 0) throw;
        Bid existing = pageBids[pageId];
        if (msg.value <= existing.value) throw;
        if (existing.value > 0) {
            // Refund the failing bid
            pendingWithdrawals[existing.bidder] += existing.value;
        }
        pageBids[pageId] = Bid(true, pageId, msg.sender, msg.value);
        PageBidEntered(pageId, msg.value, msg.sender);
    }

    /// Accepts a bid for a page a seller owns
    /// @param pageId ID of the page in question
    /// @param minPrice minimum price the selleer will accept for the page
    function acceptBidForPage(uint pageId, uint minPrice) {
        if (pageIdToAddress[pageId] != msg.sender) throw;
        address seller = msg.sender;
        Bid bid = pageBids[pageId];
        if (bid.value == 0) throw;
        if (bid.value < minPrice) throw;

        pageIdToAddress[pageId] = bid.bidder;
        balanceOf[seller]--;
        balanceOf[bid.bidder]++;
        Transfer(seller, bid.bidder, 1);

        pagesOfferedForSale[pageId] = Offer(false, pageId, bid.bidder, 0);
        uint amount = bid.value;
        pageBids[pageId] = Bid(false, pageId, 0x0, 0);
        pendingWithdrawals[seller] += amount;
        PageBought(pageId, bid.value, seller, bid.bidder);
    }

    /// Withdraws an outstanding bid made against a page
    /// @param pageId ID of the page the bid is placed against
    function withdrawBidForPage(uint pageId) {
        if (pageIdToAddress[pageId] == 0x0) throw;
        if (pageIdToAddress[pageId] == msg.sender) throw;

        Bid bid = pageBids[pageId];
        if (bid.bidder != msg.sender) throw;
        PageBidWithdrawn(pageId, bid.value, msg.sender);
        uint amount = bid.value;
        pageBids[pageId] = Bid(false, pageId, 0x0, 0);
        // Refund the bid money
        msg.sender.transfer(amount);
    }

}