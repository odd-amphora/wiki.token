// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

/// ERC721 Contract for WikiToken.
///
/// @author The Wiki Token team.
/// @title Wiki Token ERC 721 contract.
contract Token is Ownable, ERC721Enumerable {
    /// Minted page ids in order, used for pagination and getting all of the tokens belonging to an address.
    uint[] private _mintedWikipediaPageIds;
 
    /// Wiki Token constructor.
    /// @param baseURI Base URI that will be applied to all tokens.
    constructor (string memory baseURI) public ERC721("WikiToken", "WIKI") {
        setBaseURI(baseURI);
    }

    /// Sets base URI for all tokens.
    /// @param baseURI Base URI that will be set.
    function setBaseURI(string memory baseURI) public onlyOwner {
        setBaseURI(baseURI);
    }

    /// Mints a Wiki Token.
    /// @param wikipediaPageId Wikipedia page that will be minted as a token.
    function mintWikipediaPage(uint wikipediaPageId) public {
        _mint(msg.sender, wikipediaPageId);
        _mintedWikipediaPageIds.push(wikipediaPageId);
    }      

    /// Checks if token for the given Wikipedia page is claimed.
    /// @param pageId ID of token in question.
    /// @return True if claimed, false otherwise.
    function isWikipediaPageClaimed(uint pageId) public view returns (bool) {
        return _exists(pageId);
    }

    /// Returns all of the tokens belonging to an address.
    /// @param owner Address of the owner we are finding tokens for.
    function tokensOfOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        }
        uint256[] memory result = new uint256[](tokenCount);
        uint256 index;
        for (index = 0; index < tokenCount; index++) {
            result[index] = tokenOfOwnerByIndex(owner, index);
        }
        return result;
    }      

    /// Fetches tokens belonging to any address.
    /// @param cursor Index paginated results should start at.
    /// @param howMany How many results should be returned.
    function discover(
        uint cursor,
        uint howMany,
        bool ascending
    ) public view returns (uint[] memory result, uint newCursor, bool reachedEnd) {
        return _paginate(cursor, howMany, ascending, _mintedWikipediaPageIds);
    }

    /// Paginates items in a uint array.
    /// @param cursor Position to start at.
    /// @param howMany Max number of items to return.
    /// @param ascending Index array in ascending/descending order.
    /// @param array Data that will be indexed.
    /// @dev uint Array type could be templated once solidity supports this.
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

        /// Determine cursor position depending on length and
        uint cursor_ = cursor;
        uint length = Math.min(howMany, array.length - cursor);
        uint cursorInternal = ascending
            ? cursor
            : array.length - 1 - cursor;
        
        /// Allocate space for the resulting array and push paginated items.
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

}