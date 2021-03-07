// TODO(teddywilson) validate events emitted

const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");

const TEST_BASE_URI = "https://bananabread.com/api/";
const TEST_INITIAL_DONATION_PERCENTAGE = 1;

function sanitizeOffer(offer) {
  return {
    isForSale: offer.isForSale,
    seller: offer.seller,
    minValue: BigNumber.from(offer.minValue).toNumber(),
    requiredDonation: BigNumber.from(offer.requiredDonation).toNumber(),
  };
}

function sanitizeBid(bid) {
  return {
    hasBid: bid.hasBid,
    pageId: BigNumber.from(bid.pageId).toNumber(),
    bidder: bid.bidder,
    value: BigNumber.from(bid.value).toNumber(),
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

  // TODO(teddywilson) add tests to tokensOf() and discover()

  describe("setDonationPercentage()", function () {
    it("Should set donation percentage", async function () {
      expect(await hardhatToken.donationPercentage()).to.equal(TEST_INITIAL_DONATION_PERCENTAGE);

      await hardhatToken.setDonationPercentage(/*donationPercentage=*/ 2);
      expect(await hardhatToken.donationPercentage()).to.equal(2);

      await expect(hardhatToken.setDonationPercentage(/*donationPercentage=*/ 0)).to.be.reverted;
      await expect(hardhatToken.setDonationPercentage(/*donationPercentage=*/ 101)).to.be.reverted;

      await expect(hardhatToken.setDonationPercentage(/*donationPercentage=*/ 1)).to.not.be
        .reverted;
      await expect(hardhatToken.setDonationPercentage(/*donationPercentage=*/ 100)).to.not.be
        .reverted;
    });
  });

  describe("buyPage()", function () {
    it("Should fail if page is not for sale", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await expect(hardhatToken.buyPage(/*pageId=*/ 1)).to.be.revertedWith(`Page is not for sale`);

      await hardhatToken.mintPage(/*pageId=*/ 2);
      await expect(hardhatToken.buyPage(/*pageId=*/ 2)).to.be.revertedWith(`Page is not for sale`);
    });

    it("Should fail if buyer attempts to repurchase a page they already own", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.offerPageForSale(/*pageId=*/ 1, 100);
      await expect(hardhatToken.buyPage(/*pageId=*/ 1)).to.be.revertedWith(
        `Buyer can't repurchase their own pages`,
      );
    });

    it("Should fail if value < minValue + requiredDonation", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.offerPageForSale(/*pageId=*/ 1, 100);
      // Entire cost of tx should be 101, with 1% default donation
      let error = null;
      try {
        await hardhatToken.connect(addr1).buyPage(/*pageId=*/ 1, { value: 100 });
      } catch (err) {
        error = err;
      }
      expect(error).to.be.an(`Error`);
      expect(error.message).to.equal(
        `VM Exception while processing transaction: revert Not enough to cover minValue + requiredDonation`,
      );
    });

    it("Should succeed if buyer is able to purchase page", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      expect(await hardhatToken.pageIdToAddress(1)).to.equal(owner.address);

      await hardhatToken.offerPageForSale(/*pageId=*/ 1, 100);
      // Expect no error to be thrown
      await hardhatToken.connect(addr1).buyPage(/*pageId=*/ 1, { value: 101 });

      expect(await hardhatToken.pageIdToAddress(1)).to.equal(addr1.address);
    });

    it("Should cover bid case", async function () {
      // TODO(teddywilson) implement once bidding implemented
    });
  });

  describe("offerPageForSale()", function () {
    it("Should fail if owner does not own page", async function () {
      await expect(hardhatToken.offerPageForSale(/*pageId=*/ 1, 100)).to.be.revertedWith(
        `Page must be owned by sender`,
      );
    });

    it("Should fail on overflow", async function () {
      // TODO(teddywilson) implement
    });

    it("Should successfully offer page and emit event", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.offerPageForSale(/*pageId=*/ 1, 100);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(/*pageId=*/ 1))).to.deep.equals({
        isForSale: true,
        seller: owner.address,
        minValue: 100,
        requiredDonation: calculateRequiredDonation(100),
      });

      await hardhatToken.connect(addr1).mintPage(/*pageId=*/ 2);
      await hardhatToken.connect(addr1).offerPageForSale(/*pageId=*/ 2, 1000);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(2))).to.deep.equals({
        isForSale: true,
        seller: addr1.address,
        minValue: 1000,
        requiredDonation: calculateRequiredDonation(1000),
      });

      await hardhatToken.connect(addr2).mintPage(/*pageId=*/ 3);
      await hardhatToken.connect(addr2).offerPageForSale(/*pageId=*/ 3, 1270);
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
      await expect(hardhatToken.pageNoLongerForSale(/*pageId=*/ 1)).to.be.reverted;

      await hardhatToken.mintPage(/*pageId=*/ 1);
      await expect(hardhatToken.connect(addr1).pageNoLongerForSale(/*pageId=*/ 1)).to.be.reverted;
    });

    it("Should successfully remove page from marketplace", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.offerPageForSale(/*pageId=*/ 1, 100);
      await hardhatToken.pageNoLongerForSale(/*pageId=*/ 1);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(/*pageId=*/ 1))).to.deep.equals({
        isForSale: false,
        seller: owner.address,
        minValue: 0,
        requiredDonation: 0,
      });

      await hardhatToken.connect(addr1).mintPage(/*pageId=*/ 2);
      await hardhatToken.connect(addr1).offerPageForSale(/*pageId=*/ 2, 3829);
      await hardhatToken.connect(addr1).pageNoLongerForSale(/*pageId=*/ 2);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(2))).to.deep.equals({
        isForSale: false,
        seller: addr1.address,
        minValue: 0,
        requiredDonation: 0,
      });
    });
  });

  describe("enterBidForPage()", function () {
    it("Should fail if page has no owner", async function () {
      await expect(hardhatToken.enterBidForPage(/*pageId=*/ 1)).to.be.revertedWith(
        `Page has no owner`,
      );
      await expect(hardhatToken.enterBidForPage(/*pageId=*/ 2)).to.be.revertedWith(
        `Page has no owner`,
      );
      await expect(hardhatToken.enterBidForPage(/*pageId=*/ 3)).to.be.revertedWith(
        `Page has no owner`,
      );
    });

    it("Should fail if bidder already owns page", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await expect(hardhatToken.enterBidForPage(/*pageId=*/ 1)).to.be.revertedWith(
        `Bidder already owns this page`,
      );

      await hardhatToken.connect(addr1).mintPage(/*pageId=*/ 2);
      await expect(hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 2)).to.be.revertedWith(
        `Bidder already owns this page`,
      );

      await hardhatToken.connect(addr2).mintPage(/*pageId=*/ 3);
      await expect(hardhatToken.connect(addr2).enterBidForPage(/*pageId=*/ 3)).to.be.revertedWith(
        `Bidder already owns this page`,
      );
    });

    it("Should fail if value is 0", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);

      let error = null;
      try {
        await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 0 });
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an(`Error`);
      expect(error.message).to.equal(
        `VM Exception while processing transaction: revert Bid must be greater than zero`,
      );
    });

    it("Should succeed if no previous bid has been made", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 10 });

      expect(sanitizeBid(await hardhatToken.pageBids(1))).to.deep.equals({
        hasBid: true,
        pageId: 1,
        bidder: addr1.address,
        value: 10,
      });
    });

    it("Should succeed and override previous bid if amount is greater", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 10 });
      await hardhatToken.connect(addr2).enterBidForPage(/*pageId=*/ 1, { value: 30 });

      expect(sanitizeBid(await hardhatToken.pageBids(1))).to.deep.equals({
        hasBid: true,
        pageId: 1,
        bidder: addr2.address,
        value: 30,
      });

      // The previous bidder (address 1) should be refunded for their original amount
      expect(await hardhatToken.pendingWithdrawals(addr1.address)).to.equal(10);

      // Make another bid from address 1
      expect(await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 70 }));
      expect(sanitizeBid(await hardhatToken.pageBids(1))).to.deep.equals({
        hasBid: true,
        pageId: 1,
        bidder: addr1.address,
        value: 70,
      });

      // Address 2 should be refunded
      expect(await hardhatToken.pendingWithdrawals(addr2.address)).to.equal(30);

      // Make another bid from address 2
      expect(await hardhatToken.connect(addr2).enterBidForPage(/*pageId=*/ 1, { value: 700 }));

      // Address 1s withdrawals should include both bids (10 + 70);
      expect(await hardhatToken.pendingWithdrawals(addr1.address)).to.equal(80);
    });
  });

  describe("acceptBidForPage()", function () {
    it("Should fail if page doesn't belong to sender", async function () {
      await expect(
        hardhatToken.acceptBidForPage(/*pageId=*/ 1, /*minPrice=*/ 10),
      ).to.be.revertedWith(`Page must be owned by sender`);

      await hardhatToken.mintPage(/*pageId=*/ 1);
      await expect(
        hardhatToken.connect(addr1).acceptBidForPage(/*pageId=*/ 1, /*minPrice=*/ 10),
      ).to.be.revertedWith(`Page must be owned by sender`);
    });

    it("Should fail if bid value is 0", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await expect(
        hardhatToken.acceptBidForPage(/*pageId=*/ 1, /*minPrice=*/ 10),
      ).to.be.revertedWith(`Bid value must be greater than zero`);
    });

    // TODO(teddywilson) finish bidding
  });

  describe("withdrawBidForPage()", function () {
    it("TODO(teddywilson) implement", async function () {
      // TODO(teddywilson) implement
    });
  });

  describe("withdrawPendingFunds()", function () {
    it("TODO(teddywilson) implement", async function () {
      // TODO(teddywilson) implement
    });
  });
});
