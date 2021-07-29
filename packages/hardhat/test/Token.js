const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");

const TEST_BASE_URI = `https://bananabread.com/api/`;
const TEST_INITIAL_DONATION_PERCENTAGE = 1;

const EXCEPTION_PREFIX = `VM Exception while processing transaction: revert `;

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

    args = [TEST_BASE_URI, TEST_INITIAL_DONATION_PERCENTAGE];
    hardhatToken = await Token.deploy(...args);
  });

  describe("mintPage()", function () {
    it("Should not mint pages that have already been claimed", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await expect(hardhatToken.mintPage(/*pageId=*/ 1)).to.be.reverted;

      await hardhatToken.mintPage(/*pageId=*/ 2);
      await expect(hardhatToken.mintPage(/*pageId=*/ 2)).to.be.reverted;
    });

    it("Should mint tokens with proper URI", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      expect(await hardhatToken.tokenURI(/*pageId=*/ 1)).to.equal(TEST_BASE_URI.concat(1));

      await hardhatToken.mintPage(/*pageId=*/ 9226);
      expect(await hardhatToken.tokenURI(/*pageId=*/ 9226)).to.equal(TEST_BASE_URI.concat(9226));

      await hardhatToken.mintPage(/*pageId=*/ 29384);
      expect(await hardhatToken.tokenURI(/*pageId=*/ 29384)).to.equal(TEST_BASE_URI.concat(29384));

      await hardhatToken.mintPage(/*pageId=*/ 12891648290);
      expect(await hardhatToken.tokenURI(/*pageId=*/ 12891648290)).to.equal(
        TEST_BASE_URI.concat(12891648290),
      );

      // TODO(bingbongle) Cover new data structures that been added.
    });
  });

  describe("isClaimed()", function () {
    it("Should return true if already claimed, false otherwise", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      expect(await hardhatToken.isClaimed(/*pageId=*/ 1)).to.be.true;

      await hardhatToken.mintPage(/*pageId=*/ 2);
      expect(await hardhatToken.isClaimed(/*pageId=*/ 2)).to.be.true;

      await hardhatToken.mintPage(/*pageId=*/ 3);
      expect(await hardhatToken.isClaimed(/*pageId=*/ 3)).to.be.true;

      expect(await hardhatToken.isClaimed(/*pageId=*/ 4)).to.be.false;
      expect(await hardhatToken.isClaimed(/*pageId=*/ 5)).to.be.false;
      expect(await hardhatToken.isClaimed(/*pageId=*/ 6)).to.be.false;
      expect(await hardhatToken.isClaimed(/*pageId=*/ 7)).to.be.false;
      expect(await hardhatToken.isClaimed(/*pageId=*/ 8)).to.be.false;
    });
  });
});
