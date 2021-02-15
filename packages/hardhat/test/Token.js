const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");

const TEST_BASE_URI = "https://bananabread.com/api/";

describe("Token Contract", function () {
  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    args = [TEST_BASE_URI];
    hardhatToken = await Token.deploy(...args);
  });

  describe("mint()", function () {
    it("Should not mint pages that have already been claimed", async function () {
      await hardhatToken.mint(1);
      await expect(hardhatToken.mint(1)).to.be.reverted;

      await hardhatToken.mint(2);
      await expect(hardhatToken.mint(2)).to.be.reverted;
    });

    it("Should mint tokens with proper URI", async function () {
      await hardhatToken.mint(1);
      expect(await hardhatToken.tokenURI(1)).to.equal(TEST_BASE_URI.concat(1));

      await hardhatToken.mint(9226);
      expect(await hardhatToken.tokenURI(9226)).to.equal(TEST_BASE_URI.concat(9226));

      await hardhatToken.mint(29384);
      expect(await hardhatToken.tokenURI(29384)).to.equal(TEST_BASE_URI.concat(29384));

      await hardhatToken.mint(12891648290);
      expect(await hardhatToken.tokenURI(12891648290)).to.equal(TEST_BASE_URI.concat(12891648290));
    });
  });

  describe("isClaimed()", function () {
    it("Should return true if already claimed, false otherwise", async function () {
      await hardhatToken.mint(1);
      expect(await hardhatToken.isClaimed(1)).to.be.true;

      await hardhatToken.mint(2);
      expect(await hardhatToken.isClaimed(2)).to.be.true;

      await hardhatToken.mint(3);
      expect(await hardhatToken.isClaimed(3)).to.be.true;

      expect(await hardhatToken.isClaimed(4)).to.be.false;
      expect(await hardhatToken.isClaimed(5)).to.be.false;
      expect(await hardhatToken.isClaimed(6)).to.be.false;
      expect(await hardhatToken.isClaimed(7)).to.be.false;
      expect(await hardhatToken.isClaimed(8)).to.be.false;
    });
  });

  // TODO(teddywilson) add tests to tokensOf() and discover()
});
