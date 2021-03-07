// TODO(bingbongle) validate events emitted

const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");

const TEST_BASE_URI = `https://bananabread.com/api/`;
const TEST_INITIAL_DONATION_PERCENTAGE = 1;

const EXCEPTION_PREFIX = `VM Exception while processing transaction: revert `;

function sanitizeOffer(offer, convertBigNumber = true) {
  return {
    isForSale: offer.isForSale,
    seller: offer.seller,
    minValue: convertBigNumber ? BigNumber.from(offer.minValue).toNumber() : offer.minValue,
    requiredDonation: convertBigNumber
      ? BigNumber.from(offer.requiredDonation).toNumber()
      : offer.requiredDonation,
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

function calculateDonation(value, donationPercentage = TEST_INITIAL_DONATION_PERCENTAGE) {
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

  // TODO(bingbongle) add tests to tokensOf() and discover()

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
      await hardhatToken.offerPageForSale(/*pageId=*/ 1, /*minSalePriceInWei=*/ 100);
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
        EXCEPTION_PREFIX.concat(`Not enough to cover minValue + requiredDonation`),
      );
    });

    it("Should succeed if buyer is able to purchase page", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      expect(await hardhatToken.pageIdToAddress(1)).to.equal(owner.address);

      await hardhatToken.offerPageForSale(/*pageId=*/ 1, /*minSalePriceInWei=*/ 100);
      // Expect no error to be thrown
      await hardhatToken.connect(addr1).buyPage(/*pageId=*/ 1, { value: 101 });

      expect(await hardhatToken.pageIdToAddress(1)).to.equal(addr1.address);
    });

    it("Should remove pending bid from buyer if they buy up front", async function () {
      let minSalePriceInWei = 100;
      let donation = calculateDonation(minSalePriceInWei);

      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.offerPageForSale(/*pageId=*/ 1, minSalePriceInWei);

      let buyPrice = minSalePriceInWei + donation;
      await hardhatToken.connect(addr1).enterBidForPage(1, { value: buyPrice });
      await hardhatToken.connect(addr1).buyPage(/*pageId=*/ 1, { value: buyPrice });

      expect(await hardhatToken.pendingWithdrawals(addr1.address)).to.equal(buyPrice);
      expect(sanitizeBid(await hardhatToken.pageBids(1))).to.deep.equals({
        hasBid: false,
        pageId: 1,
        bidder: `0x0000000000000000000000000000000000000000`,
        value: 0,
      });
    });
  });

  describe("offerPageForSale()", function () {
    it("Should fail if owner does not own page", async function () {
      await expect(hardhatToken.offerPageForSale(/*pageId=*/ 1, 100)).to.be.revertedWith(
        `Page must be owned by sender`,
      );
    });

    it("Should fail if max price exceeded", async function () {
      await hardhatToken.setDonationPercentage(/*donationPercentage=*/ 100);

      /// minSalePriceInWei = MAX_PRICE + 1
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await expect(
        hardhatToken.offerPageForSale(
          /*pageId=*/ 1,
          /*minSalePriceInWei=*/ `1157920892373161954235709850086879078532699846656405640394575840079131296400`,
        ),
      ).to.be.revertedWith(`Min sale price exceeds MAX_PRICE`);
    });

    it("Should successfully offer page with valid page and price", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.offerPageForSale(/*pageId=*/ 1, 100);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(/*pageId=*/ 1))).to.deep.equals({
        isForSale: true,
        seller: owner.address,
        minValue: 100,
        requiredDonation: calculateDonation(100),
      });

      await hardhatToken.connect(addr1).mintPage(/*pageId=*/ 2);
      await hardhatToken
        .connect(addr1)
        .offerPageForSale(/*pageId=*/ 2, /*minSalePriceInWei=*/ 1000);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(2))).to.deep.equals({
        isForSale: true,
        seller: addr1.address,
        minValue: 1000,
        requiredDonation: calculateDonation(1000),
      });

      await hardhatToken.connect(addr2).mintPage(/*pageId=*/ 3);
      await hardhatToken
        .connect(addr2)
        .offerPageForSale(/*pageId=*/ 3, /*minSalePriceInWei=*/ 1270);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(3))).to.deep.equals({
        isForSale: true,
        seller: addr2.address,
        minValue: 1270,
        requiredDonation: calculateDonation(1270),
      });

      /// minSalePriceInWei = MAX_PRICE
      await hardhatToken.connect(addr1).mintPage(/*pageId=*/ 4);
      await hardhatToken
        .connect(addr1)
        .offerPageForSale(
          /*pageId=*/ 2,
          /*minSalePriceInWei=*/ `1157920892373161954235709850086879078532699846656405640394575840079131296399`,
        );
      /// These cases where big number can not be converted can be converted in the frontend, but, we're talking
      /// on the order of 1,907,987,308,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000 USD
      /// At least on 03/07/21 :)
      expect(
        sanitizeOffer(await hardhatToken.pagesOfferedForSale(2), /*convertBigNumber=*/ false),
      ).to.deep.equals({
        isForSale: true,
        seller: addr1.address,
        minValue: BigNumber.from(
          `0x028f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f`,
        ),
        requiredDonation: BigNumber.from(
          `0x068db8bac710cb295e9e1b089a027525460aa64c2f837b4a2339c0ebedfa43`,
        ),
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
      expect(error.message).to.equal(EXCEPTION_PREFIX.concat(`Bid must be greater than zero`));
    });

    // TODO(bingbongle) Test exceeds tx limit. Coverage in buyPage() should be sufficient,
    //                   but perhaps fix at later date.
    // it("Should fail if value exeeds max price", async function () {
    //   await hardhatToken.mintPage(/*pageId=*/ 1);

    //   let error = null;
    //   try {
    //     await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, {
    //       value: `1157920892373161954235709850086879078532699846656405640394575840079131296399`,
    //     });
    //   } catch (err) {
    //     error = err;
    //   }

    //   expect(error).to.be.an(`Error`);
    //   expect(error.message).to.equal(EXCEPTION_PREFIX.concat(`Bid value exceeds MAX_PRICE`));
    // });

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

    it("Should fail if bid value is less than min price", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 30 });

      let error = null;
      try {
        await hardhatToken.acceptBidForPage(/*pageId=*/ 1, /*minPrice=*/ 31);
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an(`Error`);
      expect(error.message).to.equal(
        EXCEPTION_PREFIX.concat(`Bid value must be greater than or equal to minimum price`),
      );
    });

    it("Should receive no donation if bid value below 100", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 30 });
      await hardhatToken.acceptBidForPage(/*pageId=*/ 1, /*minPrice=*/ 30);

      // Offer should belong to the bidder (address 1) and not be for sale.
      expect(await hardhatToken.pageIdToAddress(1)).to.equal(addr1.address);
      expect(sanitizeOffer(await hardhatToken.pagesOfferedForSale(/*pageId=*/ 1))).to.deep.equals({
        isForSale: false,
        seller: addr1.address,
        minValue: 0,
        requiredDonation: 0,
      });

      // Bid should be reset for this page.
      expect(sanitizeBid(await hardhatToken.pageBids(1))).to.deep.equals({
        hasBid: false,
        pageId: 1,
        bidder: `0x0000000000000000000000000000000000000000`,
        value: 0,
      });

      // The donation holder and the owner of pageId 1 are the same, so we expect the balance to
      // increase by (bid.value + donatedAmount). However, since the bid value is 30, the donated
      // amount will be rounded to zero, thus only receiving the bid value.
      expect(await hardhatToken.pendingWithdrawals(owner.address)).to.equal(30);
    });

    it("Owner should receive full value if owner", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 300 });
      await hardhatToken.acceptBidForPage(/*pageId=*/ 1, /*minPrice=*/ 300);

      // Similar to the previous test, except this time the bid value is sufficient to yield a donation.
      // That said, we still only expect the page owner's (the contract owner) total amount to equal
      // the cost of the bid. That is because the calculation is done in the following way:
      //   balance[pageOwner] += bid.value - donatedAmount
      //   balance[contractOwner] += donatedAmount
      expect(await hardhatToken.pendingWithdrawals(owner.address)).to.equal(300);
    });

    it("Contract owner should receive donation and page owner should receive bid value", async function () {
      await hardhatToken.connect(addr1).mintPage(/*pageId=*/ 1);
      await hardhatToken.connect(addr2).enterBidForPage(/*pageId=*/ 1, { value: 300 });
      await hardhatToken.connect(addr1).acceptBidForPage(/*pageId=*/ 1, /*minPrice=*/ 300);

      let donation = calculateDonation(/*value=*/ 300);
      expect(await hardhatToken.pendingWithdrawals(addr1.address)).to.equal(300 - donation);
      expect(await hardhatToken.pendingWithdrawals(owner.address)).to.equal(donation);
    });
  });

  describe("withdrawBidForPage()", function () {
    it("Should fail if page is not currently owned", async function () {
      await expect(hardhatToken.withdrawBidForPage(/*pageId=*/ 2)).to.be.revertedWith(
        `Page is not currently owned`,
      );

      await expect(
        hardhatToken.connect(addr1).withdrawBidForPage(/*pageId=*/ 23),
      ).to.be.revertedWith(`Page is not currently owned`);
    });

    it("Should fail if page belongs to the sender", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await expect(hardhatToken.withdrawBidForPage(/*pageId=*/ 1)).to.be.revertedWith(
        `Page cannot be owned by the sender`,
      );

      await hardhatToken.connect(addr1).mintPage(/*pageId=*/ 101);
      await expect(
        hardhatToken.connect(addr1).withdrawBidForPage(/*pageId=*/ 101),
      ).to.be.revertedWith(`Page cannot be owned by the sender`);
    });

    it("Should fail if outstanding bid is not owned by sender", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 404 });
      await expect(
        hardhatToken.connect(addr2).withdrawBidForPage(/*pageId=*/ 1),
      ).to.be.revertedWith(`Outstanding bid must be owned by sender`);

      await hardhatToken.connect(addr2).mintPage(/*pageId=*/ 77);
      await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 77, { value: 314 });
      await expect(hardhatToken.withdrawBidForPage(/*pageId=*/ 77)).to.be.revertedWith(
        `Outstanding bid must be owned by sender`,
      );
    });

    it("Should succeed succeed if validation criteria is met", async function () {
      await hardhatToken.mintPage(/*pageId=*/ 1);

      let balanceBeforeBid = BigNumber.from(await addr1.getBalance());

      await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 404, gasPrice: 0 });

      let balanceAfterBid = await addr1.getBalance();
      let bidValue = BigNumber.from(404);
      expect(balanceAfterBid.eq(balanceBeforeBid.sub(bidValue))).to.be.true;

      await hardhatToken.connect(addr1).withdrawBidForPage(/*pageId=*/ 1, { gasPrice: 0 });

      let balanceAfterBidWithdrawal = BigNumber.from(await addr1.getBalance());
      expect(balanceBeforeBid.eq(balanceAfterBidWithdrawal)).to.be.true;

      // Bid for the page should be removed.
      expect(sanitizeBid(await hardhatToken.pageBids(1))).to.deep.equals({
        hasBid: false,
        pageId: 1,
        bidder: `0x0000000000000000000000000000000000000000`,
        value: 0,
      });
    });
  });

  describe("withdrawPendingFunds()", function () {
    it("Balance should not change after previous bid overridden", async function () {
      let originalBalance = BigNumber.from(await addr1.getBalance());

      await hardhatToken.mintPage(/*pageId=*/ 1);
      await hardhatToken.connect(addr1).enterBidForPage(/*pageId=*/ 1, { value: 10, gasPrice: 0 });
      await hardhatToken.connect(addr2).enterBidForPage(/*pageId=*/ 1, { value: 30 });

      await hardhatToken.connect(addr1).withdrawPendingFunds({ gasPrice: 0 });

      // The balance should remain the same after funds are withdrawn.
      let balanceAfterFundsWithdrawn = BigNumber.from(await addr1.getBalance());
      expect(originalBalance.eq(balanceAfterFundsWithdrawn)).to.be.true;

      // Bidder's internal balances should be reset after funds withdrawn.
      expect(await hardhatToken.pendingWithdrawals(addr1.address)).to.equal(0);
    });

    it("Seller balance should increase after page is bought", async function () {
      let originalSellerBalance = BigNumber.from(await addr1.getBalance());
      let originalOwnerBalance = BigNumber.from(await owner.getBalance());

      let pagePrice = 100;
      let donatedAmount = calculateDonation(pagePrice);

      await hardhatToken.connect(addr1).mintPage(/*pageId=*/ 1, { gasPrice: 0 });
      await hardhatToken.connect(addr1).offerPageForSale(/*pageId=*/ 1, pagePrice, { gasPrice: 0 });

      await hardhatToken
        .connect(addr2)
        .buyPage(/*pageId=*/ 1, { value: pagePrice + donatedAmount });

      await hardhatToken.connect(addr1).withdrawPendingFunds({ gasPrice: 0 });
      await hardhatToken.connect(owner).withdrawPendingFunds({ gasPrice: 0 });

      let sellerBalanceAfterFundsWithdrawn = BigNumber.from(await addr1.getBalance());
      let ownerBalanceAfterFundsWithdrawn = BigNumber.from(await owner.getBalance());

      // Balance of seller should increase by price of page; balance of owner should increase
      // by donated amount.
      expect(sellerBalanceAfterFundsWithdrawn.sub(originalSellerBalance).toNumber()).to.equal(
        pagePrice,
      );
      expect(ownerBalanceAfterFundsWithdrawn.sub(originalOwnerBalance).toNumber()).to.equal(
        donatedAmount,
      );

      // Seller and owner internal balances should be reset after funds withdrawn.
      expect(await hardhatToken.pendingWithdrawals(addr1.address)).to.equal(0);
      expect(await hardhatToken.pendingWithdrawals(owner.address)).to.equal(0);
    });
  });
});
