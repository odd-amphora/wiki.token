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
    uint[] private _mintedPageIds;

    /// Maps an address to the page ids they own
    mapping (address => uint[]) private _addressToPageIds;

    /// Maps a page id to an address
    mapping (uint => address) public pageIdToAddress;

    /// Maps a page id to its outstanding offer by the seller
    mapping (uint => Offer) public pagesOfferedForSale;

    /// Maps a page id to the highest outstanding offer
    mapping (uint => Bid) public pageBids;

    /// Pending funds to be withdrawn for each address
    mapping (address => uint) public pendingWithdrawals;

    /// Percentage of offer minValue, in additional to minValue itself, required to purchase a page
    /// e.g., 4 => 4%
    /// TODO(teddywilson) We could make this more granular (multiply by N), but maybe it's not worth dealing
    /// gas inflated multiplication + overflow logic.
    uint public donationPercentage;

    struct Offer {
        bool isForSale;
        uint pageId;
        address seller;
        uint minValue; // in ether
        uint requiredDonation; // in ether
    }

    struct Bid {
        bool hasBid;
        uint pageId;
        address bidder;
        uint value;
    }

    event Assign(address indexed to, uint pageId);
    event Transfer(address indexed from, address indexed to, uint amount);
    event Donate(address indexed from, address indexed to, uint amount);
    event PageTransfer(address indexed from, address indexed to, uint pageId);
    event PageOffered(uint indexed pageId, uint minValue, uint requiredDonation);
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

    /// Sets the donation percentage that will be baked into every marketplace transaction
    /// @param newDonationPercentageTimesOneHundred
    function setDonationPercentage(uint newDonationPercentage) public onlyOwner {
        require (
            newDonationPercentage > 0 && newDonationPercentage <= 10000,
            "Donation percentage must be greater than 0 and less than or equal to 100"
        );
        donationPercentage = newDonationPercentage;
    }

    /// Check if token for `pageId` is claimed
    /// @param pageId unique id of token in question
    /// @return true if claimed, false otherwise
    function isClaimed(uint pageId) public view returns (bool) {
        return _exists(pageId);
    }

    /// Paginates items in a uint array
    /// @param cursor position to start at
    /// @param howMany max number of items to return
    /// @param ascending index array in ascending/descending order
    /// @param array data that will be indexed
    /// @dev uint array type could be templated once solidity supports this
    function _paginate(
        uint cursor,
        uint howMany,
        bool ascending,
        uint[] storage array
    ) private view returns (uint[] memory result, uint newCursor, bool reachedEnd) {
        require (
            cursor < array.length,
            "Cursor position out of bounds"
        );
        uint cursor_ = cursor;
        uint length = Math.min(howMany, array.length - cursor);
        uint cursorInternal = ascending
            ? cursor
            : array.length - 1 - cursor;
        result = new uint[](length);
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
        uint cursor,
        uint howMany,
        bool ascending
    ) public view returns (uint[] memory result, uint newCursor, bool reachedEnd) {
        return _paginate(cursor, howMany, ascending, _mintedPageIds);
    }

    /// Fetches tokens of an address
    /// @param address_ address that tokens will be queried for
    /// @param cursor the index results should start at
    /// @param howMany how many results should be returned
    /// @dev `cursor` and `howMany` allow us to paginate results
    function tokensOf(
        address address_,
        uint cursor,
        uint howMany,
        bool ascending
    ) public view returns (uint[] memory result, uint newCursor, bool reachedEnd) {
        return _paginate(cursor, howMany, ascending, _addressToPageIds[address_]);
    }

    /// Mints a Wiki Token
    /// @param pageId Wikipedia page (by id) that will be minted as a token
    function mintPage(uint pageId) public {
        _mint(msg.sender, pageId);
        _setTokenURI(pageId, Strings.toString(pageId));

        _addressToPageIds[msg.sender].push(pageId);
        _mintedPageIds.push(pageId);

        /// TODO: find out what to do with this..
        pageIdToAddress[pageId] = msg.sender;
        emit Assign(msg.sender, pageId);
    }

    /// Purchases a page for the full offer price (or more)
    /// @param pageId ID of the page being purchased.
    function buyPage(uint pageId) public payable {
        Offer offer = pagesOfferedForSale[pageId];
        /// TODO(teddywilson) is null validation needed?
        require (offer.isForSale, "Page is not for sale");
        require (
            msg.value >= (offer.minValue + offer.requiredDonation),
            "Not enough to cover minValue + requiredDonation"
        );
        require (
            offer.seller == pageIdToAddress[pageId],
            "Offer seller is incorrect"
        );

        /// Transfer ownership of the page and indicate that it is no longer for sale
        pageIdToAddress[pageId] = msg.sender;
        pageNoLongerForSale(pageId);        

        /// Transfer funds to seller and donation address (owner).        
        pendingWithdrawals[offer.seller] += msg.value - offer.requiredDonation;
        pendingWithdrawals[owner()] += offer.requiredDonation;        
        
        emit Transfer(seller, msg.sender, msg.value - offer.requiredDonation);
        emit Donate(msg.sender, owner(), offer.requiredDonation);
        emit PageBought(pageId, msg.value, offer.seller, msg.sender);

        /// Check for the case where there is a bid from the new owner and refund it.
        /// Any other bid can stay in place.
        Bid bid = pageBids[pageId];
        if (bid.bidder == msg.sender) {
            // Kill bid and refund value
            pendingWithdrawals[msg.sender] += bid.value;
            pageBids[pageId] = Bid(false, pageId, 0x0, 0);
        }
    }    

    /// Allows a seller to indicate that a page they own is no longer for sale
    /// @param pageId ID of the page that the seller is taking off the market
    function pageNoLongerForSale(uint pageId)  public {
        require (
            pageIdToAddress[pageId] == msg.sender,
            "Page must be owned by sender"
        );
        pagesOfferedForSale[pageId] = Offer(false, pageId, msg.sender, 0);
        emit PageNoLongerForSale(pageId);
    }

    /// Allows a seller to indicate that that a page they own is up for purchase
    /// @param pageId ID of they page that the seller is putting on the market
    /// @param minSalePriceInWei Minimum sale price the seller will accept for the page
    function offerPageForSale(uint pageId, uint minSalePriceInWei)  public {
        require (
            pageIdToAddress[pageId] == msg.sender,
            "Page must be owned by sender"
        );
        // Calculate required donation. If this operation overflows, the min sale price is too high.
        // TODO(teddywilson) perhaps pin a max sale price calculated from donationPercentage and 2^256-1
        bool, uint calculatedDonation, requiredDonationTimesOneHundred = SafeMath.mul(
            donationPercentage,
            minSalePriceInWei
        );
        require (calculatedDonation, "Could not calculate donation, min sale price too high");
        uint requiredDonation = requiredDonationTimesOneHundred / 100;
        pagesOfferedForSale[pageId] = Offer(
            true,
            pageId,
            msg.sender,
            minSalePriceInWei,
            requiredDonation
        );
        emit PageOffered(pageId, minSalePriceInWei, requiredDonation);
    }

    /// Withdraw pending funds received from bids and buys
    function withdrawPendingFunds()  public {
        uint amount = pendingWithdrawals[msg.sender];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    /// Places a purchasing bid on a page
    /// @param pageId ID of the page will be placed on
    function enterBidForPage(uint pageId) public payable  {
        require (
            pageIdToAddress[pageId] != 0x0,
            "Page has no owner"
        );
        require (
            pageIdToAddress[pageId] != msg.sender,
            "Bidder already owns this page"
        );
        require (
            msg.value > 0,
            "Bid must be greater than zero"
        );

        Bid existing = pageBids[pageId];
        require (
            msg.value > existing.value,
            "Bid value must be greater than outstanding bid value"
        );
        // If all criteria is met, we can refund the outstanding bid.
        if (existing.value > 0) {
            pendingWithdrawals[existing.bidder] += existing.value;
        }
        pageBids[pageId] = Bid(true, pageId, msg.sender, msg.value);
        emit PageBidEntered(pageId, msg.value, msg.sender);
    }

    /// Accepts a bid for a page a seller owns
    /// @param pageId ID of the page in question
    /// @param minPrice minimum price the selleer will accept for the page
    function acceptBidForPage(uint pageId, uint minPrice)  public {
        require (
            pageIdToAddress[pageId] == msg.sender,
            "Page must be owned by sender"
        );

        address seller = msg.sender;
        Bid bid = pageBids[pageId];
        require (bid.value > 0, "Bid value must be greater than zero");
        require (
            bid.value >= minPrice,
            "Bid value must be greater than or equal to minimum price"
        );

        pageIdToAddress[pageId] = bid.bidder;
        emit Transfer(seller, bid.bidder, 1);
        // TODO(teddywilson) add donation bits similar to BuyPage().

        pagesOfferedForSale[pageId] = Offer(false, pageId, bid.bidder, 0);
        uint amount = bid.value;
        pageBids[pageId] = Bid(false, pageId, 0x0, 0);
        pendingWithdrawals[seller] += amount;
        emit PageBought(pageId, bid.value, seller, bid.bidder);
    }

    /// Withdraws an outstanding bid made against a page
    /// @param pageId ID of the page the bid is placed against
    function withdrawBidForPage(uint pageId)  public {
        require (
            pageIdToAddress[pageId] != 0x0,
            "Page is not currently owned"
        );
        require (
            pageIdToAddress[pageId] != msg.sender,
            "Page cannot be owned by the sender"
        );

        Bid bid = pageBids[pageId];
        require (
            bid.bidder == msg.sender,
            "Outstanding bid must be owned by sender"
        );
        emit PageBidWithdrawn(pageId, bid.value, msg.sender);
        uint amount = bid.value;
        pageBids[pageId] = Bid(false, pageId, 0x0, 0);
        // Refund the bid money
        msg.sender.transfer(amount);
    }

}