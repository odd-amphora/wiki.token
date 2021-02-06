// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract WikiToken is ERC721, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // The number of tokens each user has currently minted
  mapping (address => uint16) private _mintedTokensPerUser;

  // Maps a page to a token
  mapping(string => uint256) private _pageToTokenId;

  constructor () public ERC721("WikiToken", "WIKI") {
    // TODO(teddywilson) this will be replaced by a homegrown API.
    _setBaseURI("https://en.wikipedia.org/wiki/");
  }

  function setBaseURI(string memory baseURI) public onlyOwner {
    _setBaseURI(baseURI);
  }

  function getMaxMintableTokensPerUser() public pure returns (uint8) { 
    return 16;
  }

  function mint(string memory page) public {
    bytes memory pageBytes = bytes(page);
    require (pageBytes.length > 0, "Page must not be empty");
    // Adhere to wikipedia case sensitivity rules
    require(
      (uint8(pageBytes[0]) < uint8(65)) || (uint8(pageBytes[0]) > uint8(90)),
      "First character of page must be lowercase"
    );   
    require (_pageToTokenId[page] == 0, "Page must not be claimed");
    require (
      _mintedTokensPerUser[msg.sender] < getMaxMintableTokensPerUser(),
      "Max minted tokens reached"
    );

    _tokenIds.increment();
    uint256 newTokenId = _tokenIds.current();
    _mint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, page);

    _pageToTokenId[page] = newTokenId;
    _mintedTokensPerUser[msg.sender] += 1;
  }
}