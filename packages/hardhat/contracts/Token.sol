// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@jbox/sol/contracts/abstract/JuiceboxProject.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/// __      __  _      _        _     _____            _                     ///
/// \ \    / / (_)    | |__    (_)   |_   _|   ___    | |__    ___    _ _    ///
///  \ \/\/ /  | |    | / /    | |     | |    / _ \   | / /   / -_)  | ' \   ///
///   \_/\_/  _|_|_   |_\_\   _|_|_   _|_|_   \___/   |_\_\   \___|  |_||_|  ///
/// _|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| ///
///  "`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'///
////////////////////////////////////////////////////////////////////////////////
/// @author wikitoken.org //////////////////////////////////////////////////////
/// @title Wiki Token ERC 721 contract. ///
contract Token is ERC721Enumerable, JuiceboxProject {
  /// Minted page ids in order, used for pagination and getting all of the tokens belonging to an address.
  uint256[] private _mintedWikipediaPageIds;

  /// Base URI that WikiToken IDs will be concatenated to.
  string public baseURI;

  /// True if Juice is enblaed, false otherwise. This is useful for local testing.
  bool private _isJuiceEnabled;

  /// The minimum price required to mint a WikiToken.
  uint256 public constant MIN_MINT_PRICE = 10000000000000000; // 0.01 ETH.

  /// Wiki Token constructor.
  ///
  /// @param _baseURI Base URI that will be applied to all tokens.
  constructor(
    string memory _baseURI,
    bool isJuiceEnabled,
    uint256 _projectID,
    ITerminalDirectory _terminalDirectory
  ) JuiceboxProject(_projectID, _terminalDirectory) ERC721("WikiToken", "WIKI") {
    baseURI = _baseURI;
    _isJuiceEnabled = isJuiceEnabled;
  }

  /// Sets base URI for all tokens.
  ///
  /// @param _baseURI Base URI that will be set.
  function setBaseURI(string memory _baseURI) public onlyOwner {
    baseURI = _baseURI;
  }

  /// Returns a URI for a given token.
  ///
  /// @param tokenId ID of the token in question.
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "Token does not exist");

    return
      bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, Strings.toString(tokenId))) : "";
  }

  /// Mints a Wiki Token.
  ///
  /// @param wikipediaPageId Wikipedia page that will be minted as a token.
  function mintWikipediaPage(uint256 wikipediaPageId) external payable {
    require(msg.value >= MIN_MINT_PRICE, "Ether value sent is below the required price");

    /// Take fee into WikiTokenDAO Juicebox treasury if Juice is enabled.
    if (_isJuiceEnabled) {
      _takeFee(
        msg.value,
        msg.sender,
        string(abi.encodePacked("Minted WikiToken for Page ID ", wikipediaPageId)),
        false // _preferUnstakedTickets
      );
    }

    _mint(msg.sender, wikipediaPageId);
    _mintedWikipediaPageIds.push(wikipediaPageId);
  }

  /// Checks if the token for a corresponding Wikipedia page is claimed.
  ///
  /// @param pageId ID of token in question.
  /// @return True if claimed, false otherwise.
  function isWikipediaPageClaimed(uint256 pageId) public view returns (bool) {
    return _exists(pageId);
  }

  /// Fetches tokens belonging to a specific address via pagination.
  ///
  /// NOTE: Logic for tokensOfAddress() and discover() is not shared because different APIs are
  /// required for fetching tokens generally and fetching tokens belonging to a particular address.
  ///
  /// @param cursor Index paginated results should start at.
  /// @param howMany How many results should be returned.
  /// @param ascending True if results should be returned in ascending order.
  function tokensOfAddress(
    address owner,
    uint256 cursor,
    uint256 howMany,
    bool ascending
  )
    external
    view
    returns (
      uint256[] memory result,
      bool reachedEnd,
      uint256 newCursor
    )
  {
    uint256 tokenCount = balanceOf(owner);
    require(tokenCount > 0, "Owner has no tokens");
    require(cursor >= 0 && cursor < tokenCount, "Cursor out of bounds");

    /// Determine cursor position depending on length and
    uint256 cursor_ = cursor;
    uint256 length = Math.min(howMany, tokenCount - cursor);
    uint256 cursorInternal = ascending ? cursor : tokenCount - 1 - cursor;

    /// Allocate space for the resulting array and push paginated items.
    result = new uint256[](length);
    for (uint256 i = 0; i < length; i++) {
      result[i] = tokenOfOwnerByIndex(owner, cursorInternal);
      if (ascending) {
        cursorInternal++;
      } else {
        cursorInternal--;
      }
      cursor_++;
    }

    return (result, cursor_ == tokenCount, cursor_);
  }

  /// Fetches tokens belonging to any address via pagination.
  ///
  /// @param cursor Index paginated results should start at.
  /// @param howMany How many results should be returned.
  /// @param ascending True if results should be returned in ascending order.
  function discover(
    uint256 cursor,
    uint256 howMany,
    bool ascending
  )
    public
    view
    returns (
      uint256[] memory result,
      bool reachedEnd,
      uint256 newCursor
    )
  {
    require(_mintedWikipediaPageIds.length > 0, "No tokens have been minted");
    require(
      cursor >= 0 && cursor < _mintedWikipediaPageIds.length,
      "Cursor position out of bounds"
    );

    /// Determine cursor position depending on length and
    uint256 cursor_ = cursor;
    uint256 length = Math.min(howMany, _mintedWikipediaPageIds.length - cursor);
    uint256 cursorInternal = ascending ? cursor : _mintedWikipediaPageIds.length - 1 - cursor;

    /// Allocate space for the resulting array and push paginated items.
    result = new uint256[](length);
    for (uint256 i = 0; i < length; i++) {
      result[i] = _mintedWikipediaPageIds[cursorInternal];
      if (ascending) {
        cursorInternal++;
      } else {
        cursorInternal--;
      }
      cursor_++;
    }

    return (result, cursor_ == _mintedWikipediaPageIds.length, cursor_);
  }
}
