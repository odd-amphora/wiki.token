// TODO(teddywilson) validate events emitted

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

function calculateRequiredDonation(value, donationPercentage = TEST_INITIAL_DONATION_PERCENTAGE) {
  return Math.floor((donationPercentage * value) / 100);
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

    it("Should fail if buyer attempts to repurchase a page they already own", async function () {
      await hardhatToken.mintPage(1);
      await hardhatToken.offerPageForSale(1, 100);
      await expect(hardhatToken.buyPage(1)).to.be.revertedWith(
        `Buyer can't repurchase their own pages`,
      );
    });

    it("Should fail if value < minValue + requiredDonation", async function () {
      await hardhatToken.mintPage(1);
      await hardhatToken.offerPageForSale(1, 100);
      // Entire cost of tx should be 101, with 1% default donation
      let error = null;
      try {
        await hardhatToken.connect(addr1).buyPage(1, { value: 100 });
      } catch (err) {
        error = err;
      }
      expect(error).to.be.an(`Error`);
      expect(error.message).to.equal(
        `VM Exception while processing transaction: revert Not enough to cover minValue + requiredDonation`,
      );
    });

    it("Should succeed if buyer is able to purchase page", async function () {
      await hardhatToken.mintPage(1);
      expect(await hardhatToken.pageIdToAddress(1)).to.equal(owner.address);

      await hardhatToken.offerPageForSale(1, 100);
      // Expect no error to be thrown
      await hardhatToken.connect(addr1).buyPage(1, { value: 101 });

      expect(await hardhatToken.pageIdToAddress(1)).to.equal(addr1.address);
    });

    it("Should cover bid case", async function () {
      // TODO(teddywilson) implement once bidding implemented
    });
  });

  describe("offerPageForSale()", function () {
    it("Should fail if owner does not own page", async function () {
      await expect(hardhatToken.offerPageForSale(1, 100)).to.be.revertedWith(
        `Page must be owned by sender`,
      );
    });

    // TODO(teddywilson) implemet
    it("Should fail on overflow", async function () {});

    it("Should successfully offer page and emit event", async function () {
      await hardhatToken.mintPage(1);
      await hardhatToken.offerPageForSale(1, 100);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(1))).to.deep.equals({
        isForSale: true,
        seller: owner.address,
        minValue: 100,
        requiredDonation: calculateRequiredDonation(100),
      });

      await hardhatToken.connect(addr1).mintPage(2);
      await hardhatToken.connect(addr1).offerPageForSale(2, 1000);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(2))).to.deep.equals({
        isForSale: true,
        seller: addr1.address,
        minValue: 1000,
        requiredDonation: calculateRequiredDonation(1000),
      });

      await hardhatToken.connect(addr2).mintPage(3);
      await hardhatToken.connect(addr2).offerPageForSale(3, 1270);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(3))).to.deep.equals({
        isForSale: true,
        seller: addr2.address,
        minValue: 1270,
        requiredDonation: calculateRequiredDonation(1270),
      });
    });
  });

  describe("pageNoLongerForSale()", function () {
    it("Should fail if page not owned by sender", async function () {
      await expect(hardhatToken.pageNoLongerForSale(1)).to.be.reverted;

      await hardhatToken.mintPage(1);
      await expect(hardhatToken.connect(addr1).pageNoLongerForSale(1)).to.be.reverted;
    });

    it("Should successfully remove page from marketplace", async function () {
      await hardhatToken.mintPage(1);
      await hardhatToken.offerPageForSale(1, 100);
      await hardhatToken.pageNoLongerForSale(1);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(1))).to.deep.equals({
        isForSale: false,
        seller: owner.address,
        minValue: 0,
        requiredDonation: 0,
      });

      await hardhatToken.connect(addr1).mintPage(2);
      await hardhatToken.connect(addr1).offerPageForSale(2, 3829);
      await hardhatToken.connect(addr1).pageNoLongerForSale(2);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(2))).to.deep.equals({
        isForSale: false,
        seller: addr1.address,
        minValue: 0,
        requiredDonation: 0,
      });
    });
  });
});

describe("enterBidForPage()", function () {});

describe("acceptBidForPage()", function () {});
