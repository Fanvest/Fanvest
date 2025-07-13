const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FanStock System", function () {
    let factory, clubToken;
    let owner, club, fan1, fan2, fan3;
    let tokenPrice;

    beforeEach(async function () {
        [owner, club, fan1, fan2, fan3] = await ethers.getSigners();
        
        // Deploy Factory
        const FanStockFactory = await ethers.getContractFactory("FanStockFactory");
        factory = await FanStockFactory.deploy();
        await factory.waitForDeployment();
        
        // Token price: 1 CHZ ≈ 0.001 ETH for testing
        tokenPrice = ethers.parseEther("0.001");
        
        // Create a club token
        const factoryFee = await factory.factoryFee();
        const tx = await factory.connect(club).createClubToken(
            "FC Montreuil",
            "FC Montreuil Fan Token", 
            "FCM",
            club.address,
            tokenPrice,
            { value: factoryFee }
        );
        
        const receipt = await tx.wait();
        
        // Find the ClubTokenCreated event
        const event = receipt.logs.find(log => {
            try {
                return factory.interface.parseLog(log).name === 'ClubTokenCreated';
            } catch {
                return false;
            }
        });
        
        const tokenAddress = event ? factory.interface.parseLog(event).args[1] : receipt.logs[0].args[1];
        
        // Get ClubToken contract instance
        const ClubToken = await ethers.getContractFactory("ClubToken");
        clubToken = ClubToken.attach(tokenAddress);
    });

    describe("Factory", function () {
        it("Should create club token correctly", async function () {
            expect(await factory.getTotalClubs()).to.equal(1);
            expect(await factory.getClubToken("FC Montreuil")).to.not.equal(ethers.ZeroAddress);
            expect(await factory.clubExists("FC Montreuil")).to.be.true;
        });

        it("Should prevent duplicate club creation", async function () {
            const factoryFee = await factory.factoryFee();
            await expect(
                factory.connect(club).createClubToken(
                    "FC Montreuil",
                    "FC Montreuil Fan Token 2", 
                    "FCM2",
                    club.address,
                    tokenPrice,
                    { value: factoryFee }
                )
            ).to.be.revertedWith("Club token already exists");
        });
    });

    describe("Token Purchase", function () {
        it("Should allow fans to buy tokens", async function () {
            const amount = 10; // Buy 10 tokens
            const cost = tokenPrice * BigInt(amount);
            
            await expect(clubToken.connect(fan1).buyTokens(amount, { value: cost }))
                .to.emit(clubToken, "TokensPurchased")
                .withArgs(fan1.address, amount, cost);
            
            expect(await clubToken.balanceOf(fan1.address)).to.equal(ethers.parseEther("10"));
            expect(await clubToken.tokensSold()).to.equal(amount);
        });

        it("Should refund excess payment", async function () {
            const amount = 5;
            const cost = tokenPrice * BigInt(amount);
            const overpay = cost + ethers.parseEther("0.001");
            
            const initialBalance = await ethers.provider.getBalance(fan1.address);
            const tx = await clubToken.connect(fan1).buyTokens(amount, { value: overpay });
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            const finalBalance = await ethers.provider.getBalance(fan1.address);
            
            // Should only pay actual cost, not overpayment
            expect(finalBalance).to.equal(initialBalance - cost - gasUsed);
        });

        it("Should reject insufficient payment", async function () {
            const amount = 10;
            const insufficientPayment = tokenPrice * BigInt(amount - 1);
            
            await expect(
                clubToken.connect(fan1).buyTokens(amount, { value: insufficientPayment })
            ).to.be.revertedWith("Insufficient payment");
        });

        it("Should enforce max supply", async function () {
            const maxSupply = await clubToken.TOTAL_SUPPLY();
            
            await expect(
                clubToken.connect(fan1).buyTokens(maxSupply + 1n, { value: tokenPrice * (maxSupply + 1n) })
            ).to.be.revertedWith("Exceeds max supply");
        });
    });

    describe("Revenue Distribution", function () {
        beforeEach(async function () {
            // Fan1 buys 100 tokens, Fan2 buys 50 tokens
            await clubToken.connect(fan1).buyTokens(100, { value: tokenPrice * 100n });
            await clubToken.connect(fan2).buyTokens(50, { value: tokenPrice * 50n });
        });

        it("Should distribute revenue correctly", async function () {
            const revenue = ethers.parseEther("1"); // 1 ETH revenue
            const expectedFanShare = revenue * 10n / 100n; // 10%
            const expectedClubShare = revenue * 90n / 100n; // 90%
            
            const clubInitialBalance = await ethers.provider.getBalance(club.address);
            
            await expect(clubToken.connect(owner).distributeRevenue({ value: revenue }))
                .to.emit(clubToken, "RevenueReceived")
                .withArgs(revenue, expectedFanShare, expectedClubShare);
            
            // Check club received their share immediately
            const clubFinalBalance = await ethers.provider.getBalance(club.address);
            expect(clubFinalBalance - clubInitialBalance).to.equal(expectedClubShare);
        });

        it("Should allow fans to claim their revenue share", async function () {
            const revenue = ethers.parseEther("1");
            await clubToken.connect(owner).distributeRevenue({ value: revenue });
            
            // Fan1 has 100/150 = 66.67% of tokens, should get 66.67% of fan share
            const totalTokensSold = 150n;
            const fan1Tokens = 100n;
            const fanShare = revenue * 10n / 100n;
            const expectedFan1Share = (fanShare * fan1Tokens) / totalTokensSold;
            
            const fan1InitialBalance = await ethers.provider.getBalance(fan1.address);
            
            const tx = await clubToken.connect(fan1).claimRevenue();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            
            const fan1FinalBalance = await ethers.provider.getBalance(fan1.address);
            expect(fan1FinalBalance).to.equal(fan1InitialBalance + expectedFan1Share - gasUsed);
        });

        it("Should calculate claimable revenue correctly", async function () {
            const revenue = ethers.parseEther("1");
            await clubToken.connect(owner).distributeRevenue({ value: revenue });
            
            const fan1Claimable = await clubToken.getClaimableRevenue(fan1.address);
            const fan2Claimable = await clubToken.getClaimableRevenue(fan2.address);
            
            // Fan1: 100 tokens, Fan2: 50 tokens, Total: 150 tokens
            // Fan share: 0.1 ETH, Revenue per token: 0.1/150
            const revenuePerToken = ethers.parseEther("0.1") / 150n;
            expect(fan1Claimable).to.equal(100n * revenuePerToken);
            expect(fan2Claimable).to.equal(50n * revenuePerToken);
        });

        it("Should prevent double claiming", async function () {
            const revenue = ethers.parseEther("1");
            await clubToken.connect(owner).distributeRevenue({ value: revenue });
            
            // First claim should work
            await clubToken.connect(fan1).claimRevenue();
            
            // Second claim should fail
            await expect(clubToken.connect(fan1).claimRevenue())
                .to.be.revertedWith("No revenue to claim");
        });
    });

    describe("Governance", function () {
        beforeEach(async function () {
            // Setup token holders
            await clubToken.connect(fan1).buyTokens(60, { value: tokenPrice * 60n });
            await clubToken.connect(fan2).buyTokens(40, { value: tokenPrice * 40n });
        });

        it("Should allow token holders to create proposals", async function () {
            await expect(clubToken.connect(fan1).createProposal("Hire new coach"))
                .to.emit(clubToken, "ProposalCreated")
                .withArgs(1, "Hire new coach");
            
            const proposal = await clubToken.getProposal(1);
            expect(proposal.description).to.equal("Hire new coach");
            expect(proposal.executed).to.be.false;
        });

        it("Should prevent non-holders from creating proposals", async function () {
            await expect(clubToken.connect(fan3).createProposal("Bad proposal"))
                .to.be.revertedWith("Must own tokens to propose");
        });

        it("Should allow voting on proposals", async function () {
            await clubToken.connect(fan1).createProposal("Buy new equipment");
            
            await expect(clubToken.connect(fan1).vote(1, true))
                .to.emit(clubToken, "VoteCast")
                .withArgs(1, fan1.address, true, 60);
            
            const proposal = await clubToken.getProposal(1);
            expect(proposal.forVotes).to.equal(60);
        });

        it("Should allow club to veto proposals", async function () {
            await clubToken.connect(fan1).createProposal("Controversial decision");
            
            await expect(clubToken.connect(club).clubVeto(1))
                .to.emit(clubToken, "ClubVeto")
                .withArgs(1);
            
            const proposal = await clubToken.getProposal(1);
            expect(proposal.clubVetoed).to.be.true;
        });

        it("Should execute proposals correctly", async function () {
            await clubToken.connect(fan1).createProposal("Popular decision");
            
            // Fan1 votes for (60 tokens), Fan2 votes against (40 tokens)
            await clubToken.connect(fan1).vote(1, true);
            await clubToken.connect(fan2).vote(1, false);
            
            // Fast forward past voting deadline
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
            await ethers.provider.send("evm_mine");
            
            await expect(clubToken.connect(fan1).executeProposal(1))
                .to.emit(clubToken, "ProposalExecuted")
                .withArgs(1, true);
        });

        it("Should reject vetoed proposals even if they have majority", async function () {
            await clubToken.connect(fan1).createProposal("Vetoed decision");
            
            // Fan1 votes for (60 tokens) - should be majority
            await clubToken.connect(fan1).vote(1, true);
            
            // Club vetoes
            await clubToken.connect(club).clubVeto(1);
            
            // Fast forward past voting deadline
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
            await ethers.provider.send("evm_mine");
            
            await expect(clubToken.connect(fan1).executeProposal(1))
                .to.emit(clubToken, "ProposalExecuted")
                .withArgs(1, false); // Should fail due to veto
        });
    });

    describe("Club Management", function () {
        it("Should allow owner to end sale", async function () {
            expect(await clubToken.saleActive()).to.be.true;
            
            await clubToken.connect(club).endSale();
            
            expect(await clubToken.saleActive()).to.be.false;
            
            // Should prevent further purchases
            await expect(
                clubToken.connect(fan1).buyTokens(10, { value: tokenPrice * 10n })
            ).to.be.revertedWith("Token sale not active");
        });

        it("Should provide accurate club stats", async function () {
            await clubToken.connect(fan1).buyTokens(50, { value: tokenPrice * 50n });
            await clubToken.connect(owner).distributeRevenue({ value: ethers.parseEther("2") });
            await clubToken.connect(fan1).createProposal("Test proposal");
            
            const stats = await clubToken.getClubStats();
            expect(stats._tokensSold).to.equal(50);
            expect(stats._totalRevenue).to.equal(ethers.parseEther("2"));
            expect(stats._proposalCount).to.equal(1);
            expect(stats._saleActive).to.be.true;
        });
    });
});