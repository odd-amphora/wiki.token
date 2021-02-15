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
    /// The page ids each address has currently minted
    mapping (address => uint256[]) private _addressToPageIds;

    /// Minted page ids in order, used for pagination
    uint256[] private _mintedPageIds;

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
    /// @return pagination results, new cursor position, true if cursor reached end 
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
    /// @dev `cursor` and `howMany` allow us to paginate results
    /// @return pagination results, new cursor position, true if cursor reached end 
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
    /// @return pagination results, new cursor position, true if cursor reached end 
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
    /// TODO(teddywilson) enforce payment
    function mint(uint256 pageId) public {
        _mint(msg.sender, pageId);
        _setTokenURI(pageId, Strings.toString(pageId));

        _addressToPageIds[msg.sender].push(pageId);
        _mintedPageIds.push(pageId);
    }
}