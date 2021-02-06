const { expect } = require("chai");

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

    hardhatToken = await Token.deploy();
  });

  describe("mint()", function () {
    it("Should not mint pages that have already been claimed", async function () {
      await hardhatToken.mint(1);
      await expect(hardhatToken.mint(1)).to.be.reverted;

      await hardhatToken.mint(2);
      await expect(hardhatToken.mint(2)).to.be.reverted;
    });

    it("Should limit number of mintable tokens per address", async function () {
      const maxMintableTokensPerAddress = await hardhatToken.getMaxMintableTokensPerAddress();
      for (var i = 1; i <= maxMintableTokensPerAddress; i++) {
        await expect(hardhatToken.mint(i)).to.not.be.reverted;
      }
      await expect(hardhatToken.mint(maxMintableTokensPerAddress + 1)).to.be.reverted;
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
});
