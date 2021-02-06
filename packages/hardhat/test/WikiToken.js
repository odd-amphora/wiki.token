const { expect } = require("chai");
const BigNumber = require("bignumber.js");

describe("WikiToken Contract", function () {
  let WikiToken;
  let hardhatWikiToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    WikiToken = await ethers.getContractFactory("WikiToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hardhatWikiToken = await WikiToken.deploy();
  });

  describe("Mint", function () {
    it("Should not mint empty pages", async function () {
      await expect(hardhatWikiToken.mint()).to.be.reverted;
      await expect(hardhatWikiToken.mint(0)).to.be.reverted;
      await expect(hardhatWikiToken.mint("")).to.be.reverted;
    });

    it("Should not mint pages with first character uppercase", async function () {
      await expect(hardhatWikiToken.mint("Klein_bottle")).to.be.reverted;
      await expect(hardhatWikiToken.mint("Möbius_strip")).to.be.reverted;
      await expect(hardhatWikiToken.mint("Hopf–Rinow_theorem")).to.be.reverted;
      // Validate lowercase passes
      await expect(hardhatWikiToken.mint("klein_bottle")).to.not.be.reverted;
      await expect(hardhatWikiToken.mint("möbius_strip")).to.not.be.reverted;
      await expect(hardhatWikiToken.mint("hopf–Rinow_theorem")).to.not.be
        .reverted;
    });

    it("Should not mint pages that have already been claimed", async function () {
      await hardhatWikiToken.mint("satoshi_Nakamoto");
      await expect(hardhatWikiToken.mint("satoshi_Nakamoto")).to.be.reverted;

      await hardhatWikiToken.mint("ryokan_(inn)");
      await expect(hardhatWikiToken.mint("ryokan_(inn)")).to.be.reverted;
    });

    it("Should limit number of mintable tokens per user", async function () {
      const maxMintableTokensPerUser = await hardhatWikiToken.getMaxMintableTokensPerUser();
      for (var i = 1; i <= maxMintableTokensPerUser; i++) {
        var page = "some_page".concat(i);
        await expect(hardhatWikiToken.mint(page)).to.not.be.reverted;
      }
      await expect(hardhatWikiToken.mint("ryokan_(inn)")).to.be.reverted;
    });
  });
});