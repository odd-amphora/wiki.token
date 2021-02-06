const { expect } = require("chai");
const BigNumber = require("bignumber.js");

describe("Token Contract", function () {
  let WikiToken;
  let hardhatWikiToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hardhatToken = await Token.deploy();
  });

  describe("Mint", function () {
    it("Should not mint empty pages", async function () {
      await expect(hardhatToken.mint()).to.be.reverted;
      await expect(hardhatToken.mint(0)).to.be.reverted;
      await expect(hardhatToken.mint("")).to.be.reverted;
    });

    it("Should not mint pages with first character uppercase", async function () {
      await expect(hardhatToken.mint("Klein_bottle")).to.be.reverted;
      await expect(hardhatToken.mint("Möbius_strip")).to.be.reverted;
      await expect(hardhatToken.mint("Hopf–Rinow_theorem")).to.be.reverted;
      // Validate lowercase passes
      await expect(hardhatToken.mint("klein_bottle")).to.not.be.reverted;
      await expect(hardhatToken.mint("möbius_strip")).to.not.be.reverted;
      await expect(hardhatToken.mint("hopf–Rinow_theorem")).to.not.be.reverted;
    });

    it("Should not mint pages that have already been claimed", async function () {
      await hardhatToken.mint("satoshi_Nakamoto");
      await expect(hardhatToken.mint("satoshi_Nakamoto")).to.be.reverted;

      await hardhatToken.mint("ryokan_(inn)");
      await expect(hardhatToken.mint("ryokan_(inn)")).to.be.reverted;
    });

    it("Should limit number of mintable tokens per user", async function () {
      const maxMintableTokensPerUser = await hardhatToken.getMaxMintableTokensPerUser();
      for (var i = 1; i <= maxMintableTokensPerUser; i++) {
        var page = "some_page".concat(i);
        await expect(hardhatToken.mint(page)).to.not.be.reverted;
      }
      await expect(hardhatToken.mint("ryokan_(inn)")).to.be.reverted;
    });
  });
});
