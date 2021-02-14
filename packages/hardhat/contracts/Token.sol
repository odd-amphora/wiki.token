// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

/// @author The Wiki Token team
/// @title Wiki Token ERC 721 contract
/// TODO(teddywilson) Create "explore" API to browse recently minted tokens
/// TODO(teddywilson) Figure out Wikipedia distribution mechanism
contract Token is ERC721, Ownable {
    /// The page ids each address has currently minted
    mapping (address => uint256[]) private _addressToPageIds;

    /// Maps a Wikipedia page id to an address
    mapping (uint256 => address) private _pageIdToAddress;

    constructor () public ERC721("WikiToken", "WIKI") {
        // TODO(teddywilson) this will be replaced by a homegrown API.
        _setBaseURI("https://en.wikipedia.org/wiki/");
    }

    /// Sets base URI for tokens
    /// @param baseURI base URI that will be set
    function setBaseURI(string memory baseURI) public onlyOwner {
        _setBaseURI(baseURI);
    }

    /// Check if token for `pageId` is claimed
    /// @param pageId unique id of token in question
    function isClaimed(uint256 pageId) public view returns (bool) {
        return _pageIdToAddress[pageId] != 0x0000000000000000000000000000000000000000;
    }

    /// Fetches tokens owned by an address
    /// @param address_ address that tokens will be queried for
    /// @param cursor the index results should start at
    /// @param howMany how many results should be returned
    /// @dev `cursor` and `howMany` allow us to paginate results
    function tokens(
        address address_,
        uint256 cursor,
        uint256 howMany
    ) public view returns (uint256[] memory result, uint256 newCursor, bool reachedEnd) {
        require (
            cursor < _addressToPageIds[address_].length,
            "Cursor position out of bounds"
        );
        uint256 length = Math.min(
            howMany,
            _addressToPageIds[address_].length - cursor
        );
        result = new uint256[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = _addressToPageIds[address_][cursor++];
        }
        return (result, cursor, cursor == _addressToPageIds[address_].length);
    }

    /// Mints a Wiki Token
    /// @param pageId Wikipedia page (by id) that will be minted as a token
    /// TODO(teddywilson) enforce payment
    function mint(uint256 pageId) public {
        require (!isClaimed(pageId), "Page must not be claimed");
        require (
            _addressToPageIds[msg.sender].length < getMaxMintableTokensPerAddress(),
            "Max minted tokens reached"
        );

        _mint(msg.sender, pageId);
        _setTokenURI(pageId, Strings.toString(pageId));

        _pageIdToAddress[pageId] = msg.sender;
        _addressToPageIds[msg.sender].push(pageId);
    }
}