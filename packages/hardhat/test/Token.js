const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");

const TEST_BASE_URI = "https://bananabread.com/api/";
const TEST_INITIAL_DONATION_PERCENTAGE = 1;

function sanitizeOffer(offer) {
  var minValue = BigNumber.from(offer.minValue).toNumber();
  var requiredDonation = BigNumber.from(offer.requiredDonation).toNumber();
  return {
    isForSale: offer.isForSale,
    seller: offer.seller,
    minValue: minValue,
    requiredDonation: requiredDonation,
  };
}

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
      await hardhatToken.mintPage(1);
      await expect(hardhatToken.mintPage(1)).to.be.reverted;

      await hardhatToken.mintPage(2);
      await expect(hardhatToken.mintPage(2)).to.be.reverted;
    });

    it("Should mint tokens with proper URI", async function () {
      await hardhatToken.mintPage(1);
      expect(await hardhatToken.tokenURI(1)).to.equal(TEST_BASE_URI.concat(1));

      await hardhatToken.mintPage(9226);
      expect(await hardhatToken.tokenURI(9226)).to.equal(TEST_BASE_URI.concat(9226));

      await hardhatToken.mintPage(29384);
      expect(await hardhatToken.tokenURI(29384)).to.equal(TEST_BASE_URI.concat(29384));

      await hardhatToken.mintPage(12891648290);
      expect(await hardhatToken.tokenURI(12891648290)).to.equal(TEST_BASE_URI.concat(12891648290));
    });
  });

  describe("isClaimed()", function () {
    it("Should return true if already claimed, false otherwise", async function () {
      await hardhatToken.mintPage(1);
      expect(await hardhatToken.isClaimed(1)).to.be.true;

      await hardhatToken.mintPage(2);
      expect(await hardhatToken.isClaimed(2)).to.be.true;

      await hardhatToken.mintPage(3);
      expect(await hardhatToken.isClaimed(3)).to.be.true;

      expect(await hardhatToken.isClaimed(4)).to.be.false;
      expect(await hardhatToken.isClaimed(5)).to.be.false;
      expect(await hardhatToken.isClaimed(6)).to.be.false;
      expect(await hardhatToken.isClaimed(7)).to.be.false;
      expect(await hardhatToken.isClaimed(8)).to.be.false;
    });
  });

  // TODO(teddywilson) add tests to tokensOf() and discover()

  describe("setDonationPercentage()", function () {
    it("Should set donation percentage", async function () {
      expect(await hardhatToken.donationPercentage()).to.equal(TEST_INITIAL_DONATION_PERCENTAGE);

      await hardhatToken.setDonationPercentage(2);
      expect(await hardhatToken.donationPercentage()).to.equal(2);

      await expect(hardhatToken.setDonationPercentage(0)).to.be.reverted;
      await expect(hardhatToken.setDonationPercentage(101)).to.be.reverted;

      await expect(hardhatToken.setDonationPercentage(1)).to.not.be.reverted;
      await expect(hardhatToken.setDonationPercentage(100)).to.not.be.reverted;
    });
  });

  describe("buyPage()", function () {
    it("Should fail if page is not for sale", async function () {
      await hardhatToken.mintPage(1);
      await expect(hardhatToken.buyPage(1)).to.be.revertedWith(`Page is not for sale`);

      await hardhatToken.mintPage(2);
      await expect(hardhatToken.buyPage(2)).to.be.revertedWith(`Page is not for sale`);
    });
    // TODO(teddywilson) many more
  });

  describe("offerPageForSale()", function () {
    it("Should fail if owner does not own page", async function () {
      await expect(hardhatToken.offerPageForSale(1, 100)).to.be.revertedWith(
        `Page must be owned by sender`,
      );
    });

    it("Should fail on overflow", async function () {
      // TODO(teddywilson) add
    });

    it("Should successfully offer page and emit event", async function () {
      await hardhatToken.mintPage(1);
      await hardhatToken.offerPageForSale(1, 100);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(1))).to.deep.equals({
        isForSale: true,
        seller: owner.address,
        minValue: 100,
        requiredDonation: 1,
      });

      // TODO(teddywilson) call function from another address
      // await hardhatToken.mintPage(100, { from: addr1.address });
      // await hardhatToken.offerPageForSale(100, 2000);
      // expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(100))).to.deep.equals({
      //   isForSale: true,
      //   seller: addr1.address,
      //   minValue: 2000,
      //   requiredDonation: 1,
      // });
    });
  });
});

describe("pageNoLongerForSale()", function () {});

describe("withdrawPendingFunds()", function () {});

describe("enterBidForPage()", function () {});

describe("acceptBidForPage()", function () {});
