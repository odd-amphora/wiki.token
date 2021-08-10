// TODO(odd-amphora): Add tests for paging functions. Lower priority since they don't mutate state.

const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");

const TEST_BASE_URI = `https://bananabread.com/api/`;
const FAKE_TERMINAL_DIRECTORY = "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7";

const TOKEN_PRICE = BigNumber.from("10000000000000000"); // .01 ETH
const TOKEN_PRICE_INSUFFICIENT = BigNumber.from("9999999999999999"); // .001 ETH

const EXCEPTION_PREFIX = `VM Exception while processing transaction: revert `;

describe("Token Contract", function () {
  let Token;
  let wikiToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    args = [TEST_BASE_URI, /*isJuiceEnabled=*/ false, /*projectId=*/ 1, FAKE_TERMINAL_DIRECTORY];
    wikiToken = await Token.deploy(...args);
  });

  describe("mintWikipediaPage()", function () {
    it("Should not mint pages that have already been claimed", async function () {
      await wikiToken.mintWikipediaPage(/*pageId=*/ 1, {
        value: TOKEN_PRICE,
      });
      await expect(wikiToken.mintWikipediaPage(/*pageId=*/ 1)).to.be.reverted;

      await wikiToken.mintWikipediaPage(/*pageId=*/ 2, {
        value: TOKEN_PRICE,
      });
      await expect(wikiToken.mintWikipediaPage(/*pageId=*/ 2)).to.be.reverted;
    });

    it("Should not mint pages with insufficient funds", async function () {
      // No funds.
      await expect(
        wikiToken.mintWikipediaPage(/*pageId=*/ 1, {
          value: 0,
        }),
      ).to.be.reverted;
      // Insufficient funds.
      await expect(
        wikiToken.mintWikipediaPage(/*pageId=*/ 1, {
          value: TOKEN_PRICE_INSUFFICIENT,
        }),
      ).to.be.reverted;
    });
  });

  describe("tokenURI()", function () {
    it("Should be reverted if token has not been minted", async function () {
      await expect(wikiToken.tokenURI(/*pageId=*/ 1)).to.be.reverted;
      await expect(wikiToken.tokenURI(/*pageId=*/ 2)).to.be.reverted;
      await expect(wikiToken.tokenURI(/*pageId=*/ 3)).to.be.reverted;
      await expect(wikiToken.tokenURI(/*pageId=*/ 4)).to.be.reverted;
    });

    it("Should return proper token URI.", async function () {
      await wikiToken.mintWikipediaPage(/*pageId=*/ 1, {
        value: TOKEN_PRICE,
      });
      expect(await wikiToken.tokenURI(/*pageId=*/ 1)).to.equal(`${TEST_BASE_URI}1`);

      await wikiToken.mintWikipediaPage(/*pageId=*/ 2, {
        value: TOKEN_PRICE,
      });
      expect(await wikiToken.tokenURI(/*pageId=*/ 2)).to.equal(`${TEST_BASE_URI}2`);

      await wikiToken.mintWikipediaPage(/*pageId=*/ 3, {
        value: TOKEN_PRICE,
      });
      expect(await wikiToken.tokenURI(/*pageId=*/ 3)).to.equal(`${TEST_BASE_URI}3`);
    });
  });
});
