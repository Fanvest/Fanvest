const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FanToken", function () {
  let fanToken;
  let owner;
  let fan1;
  let fan2;

  const TOKEN_NAME = "Test Fan Token";
  const TOKEN_SYMBOL = "TFT";
  const CLUB_NAME = "Test Club";
  const INITIAL_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, fan1, fan2] = await ethers.getSigners();
    
    const FanToken = await ethers.getContractFactory("FanToken");
    fanToken = await FanToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, CLUB_NAME);
    await fanToken.waitForDeployment();
  });

  describe("Déploiement", function () {
    it("Devrait définir le bon nom et symbole", async function () {
      expect(await fanToken.name()).to.equal(TOKEN_NAME);
      expect(await fanToken.symbol()).to.equal(TOKEN_SYMBOL);
      expect(await fanToken.clubName()).to.equal(CLUB_NAME);
    });

    it("Devrait attribuer le supply initial au propriétaire", async function () {
      const ownerBalance = await fanToken.balanceOf(owner.address);
      expect(await fanToken.totalSupply()).to.equal(ownerBalance);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY);
    });

    it("Devrait définir le bon propriétaire", async function () {
      expect(await fanToken.owner()).to.equal(owner.address);
    });
  });

  describe("Sondages", function () {
    it("Devrait permettre au propriétaire de créer un sondage", async function () {
      const question = "Test question?";
      const options = ["Option 1", "Option 2", "Option 3"];
      const duration = 24;

      await expect(fanToken.createPoll(question, options, duration))
        .to.emit(fanToken, "PollCreated");

      expect(await fanToken.pollCounter()).to.equal(1);
    });

    it("Ne devrait pas permettre à un non-propriétaire de créer un sondage", async function () {
      const question = "Test question?";
      const options = ["Option 1", "Option 2"];
      const duration = 24;

      await expect(
        fanToken.connect(fan1).createPoll(question, options, duration)
      ).to.be.revertedWithCustomError(fanToken, "OwnableUnauthorizedAccount");
    });

    it("Devrait permettre de voter avec suffisamment de tokens", async function () {
      // Créer un sondage
      await fanToken.createPoll("Test?", ["Option 1", "Option 2"], 24);
      
      // Transférer des tokens au fan
      const transferAmount = ethers.parseEther("200");
      await fanToken.transfer(fan1.address, transferAmount);
      
      // Voter
      await expect(fanToken.connect(fan1).vote(1, 0))
        .to.emit(fanToken, "Voted")
        .withArgs(1, fan1.address, 0, transferAmount);

      // Vérifier que le fan a voté
      expect(await fanToken.hasVoted(1, fan1.address)).to.be.true;
    });

    it("Ne devrait pas permettre de voter sans tokens suffisants", async function () {
      await fanToken.createPoll("Test?", ["Option 1", "Option 2"], 24);
      
      await expect(
        fanToken.connect(fan1).vote(1, 0)
      ).to.be.revertedWith("Insufficient tokens to vote");
    });
  });

  describe("Récompenses", function () {
    it("Devrait permettre au propriétaire de distribuer des récompenses", async function () {
      const rewardAmount = ethers.parseEther("100");
      const reason = "Test reward";

      await expect(fanToken.distributeReward(fan1.address, rewardAmount, reason))
        .to.emit(fanToken, "RewardDistributed")
        .withArgs(fan1.address, rewardAmount, reason);

      expect(await fanToken.balanceOf(fan1.address)).to.equal(rewardAmount);
    });

    it("Devrait augmenter les points de fidélité lors de la distribution", async function () {
      const rewardAmount = ethers.parseEther("100");
      await fanToken.distributeReward(fan1.address, rewardAmount, "Test");

      expect(await fanToken.fanLoyaltyPoints(fan1.address)).to.equal(100);
    });
  });

  describe("Points de fidélité", function () {
    it("Devrait attribuer des points pour voter", async function () {
      await fanToken.createPoll("Test?", ["Option 1", "Option 2"], 24);
      await fanToken.transfer(fan1.address, ethers.parseEther("200"));
      
      await fanToken.connect(fan1).vote(1, 0);
      
      expect(await fanToken.fanLoyaltyPoints(fan1.address)).to.equal(10);
    });

    it("Devrait attribuer des points pour burn des tokens", async function () {
      const burnAmount = ethers.parseEther("100");
      await fanToken.transfer(fan1.address, burnAmount);
      
      await fanToken.connect(fan1).burnTokens(burnAmount);
      
      expect(await fanToken.fanLoyaltyPoints(fan1.address)).to.equal(1000);
    });
  });
});