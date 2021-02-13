// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract Token is ERC721, Ownable {
  // The page ids each address has currently minted
  mapping (address => uint256[]) private _addressToPageIds;

  // Maps a Wikipedia page id to an address
  mapping (uint256 => address) private _pageIdToAddress;

  constructor () public ERC721("WikiToken", "WIKI") {
    // TODO(teddywilson) this will be replaced by a homegrown API.
    _setBaseURI("https://en.wikipedia.org/wiki/");
  }

  function setBaseURI(string memory baseURI) public onlyOwner {
    _setBaseURI(baseURI);
  }

  // TODO(teddywilson) this should probably be configurable
  function getMaxMintableTokensPerAddress() public pure returns (uint8) { 
    return 16;
  }

  function isClaimed(uint256 pageId) view public returns (bool) {
    return _pageIdToAddress[pageId] != 0x0000000000000000000000000000000000000000;
  }

  function tokens(address adr) view public returns (uint256[] memory) {
    return _addressToPageIds[adr];
  }

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