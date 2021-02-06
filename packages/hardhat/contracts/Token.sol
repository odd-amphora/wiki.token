// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract Token is ERC721, Ownable {
  // The number of tokens each address has currently minted
  mapping (address => uint16) private _mintedTokensPerAddress;

  // Maps a wikidataId to an address
  mapping (uint256 => address) private _wikidataIdToAddress;

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

  function isClaimed(uint256 wikidataId) view public returns (bool) {
    return _wikidataIdToAddress[wikidataId] != 0x0000000000000000000000000000000000000000;
  }

  function mint(uint256 wikidataId) public {
    require (!isClaimed(wikidataId), "Page must not be claimed");
    require (
      _mintedTokensPerAddress[msg.sender] < getMaxMintableTokensPerUser(),
      "Max minted tokens reached"
    );

    _mint(msg.sender, wikidataId);
    _setTokenURI(wikidataId, Strings.toString(wikidataId));

    _wikidataIdToAddress[wikidataId] = msg.sender;
    _mintedTokensPerAddress[msg.sender] += 1;
  }
}