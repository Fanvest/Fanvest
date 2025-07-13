const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying FanStock system to", hre.network.name);
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Deploy FanStockFactory
    console.log("\n📦 Deploying FanStockFactory...");
    const FanStockFactory = await ethers.getContractFactory("FanStockFactory");
    const factory = await FanStockFactory.deploy();
    await factory.waitForDeployment();
    
    console.log("✅ FanStockFactory deployed to:", await factory.getAddress());
    
    // Get default values
    const defaultPrice = await factory.defaultTokenPrice();
    const factoryFee = await factory.factoryFee();
    
    console.log("📊 Factory configuration:");
    console.log("- Default token price:", ethers.formatEther(defaultPrice), "CHZ");
    console.log("- Factory fee:", ethers.formatEther(factoryFee), "CHZ");
    
    // Create a demo club token
    console.log("\n🏆 Creating demo club: FC Montreuil...");
    
    const clubName = "FC Montreuil";
    const tokenName = "FC Montreuil Fan Token";
    const tokenSymbol = "FCM";
    const clubWallet = deployer.address; // Using deployer as club wallet for demo
    // Calculate real EUR/CHZ price
    let customPrice;
    try {
        const { calculateTokenPrice } = require('./updatePriceFromAPI');
        customPrice = await calculateTokenPrice(1.0); // 1 EUR per token
        console.log("✅ Prix calculé avec taux de change réel");
    } catch (error) {
        console.log("⚠️  Impossible de récupérer le prix réel, utilisation du prix fixe");
        customPrice = ethers.parseEther("0.001"); // Fallback: 0.001 CHZ per token
    }
    
    const fanVotingPower = 40; // 40% par défaut, mais le club peut choisir entre 10-49%
    const fanRevenueShare = 10; // 10% par défaut, mais le club peut choisir entre 0-15%
    console.log("- Fan voting power:", fanVotingPower + "%");
    console.log("- Club voting power:", (100 - fanVotingPower) + "% + veto");
    console.log("- Fan revenue share:", fanRevenueShare + "%");
    console.log("- Club revenue share:", (100 - fanRevenueShare) + "%");
    
    const createTx = await factory.createClubToken(
        clubName,
        tokenName,
        tokenSymbol,
        clubWallet,
        customPrice,
        fanVotingPower,
        fanRevenueShare,
        { value: factoryFee }
    );
    
    const receipt = await createTx.wait();
    
    // Find the ClubTokenCreated event
    const event = receipt.logs.find(log => {
        try {
            return factory.interface.parseLog(log).name === 'ClubTokenCreated';
        } catch {
            return false;
        }
    });
    
    const tokenAddress = event ? factory.interface.parseLog(event).args[1] : receipt.logs[0].address;
    
    console.log("✅ FC Montreuil token deployed to:", tokenAddress);
    
    // Get ClubToken instance
    const ClubToken = await ethers.getContractFactory("ClubToken");
    const clubToken = ClubToken.attach(tokenAddress);
    
    console.log("\n📈 Club Token Information:");
    console.log("- Club name:", await clubToken.clubName());
    console.log("- Token name:", await clubToken.name());
    console.log("- Token symbol:", await clubToken.symbol());
    console.log("- Token price:", ethers.formatEther(await clubToken.tokenPrice()), "CHZ");
    console.log("- Club wallet:", await clubToken.clubWallet());
    console.log("- Max supply:", (await clubToken.TOTAL_SUPPLY()).toString(), "tokens");
    console.log("- Fan voting power:", (await clubToken.fanVotingPower()).toString() + "%");
    console.log("- Club voting power:", (await clubToken.clubVotingPower()).toString() + "% + veto");
    console.log("- Fan revenue share:", (await clubToken.fanRevenueShare()).toString() + "%");
    console.log("- Club revenue share:", (await clubToken.clubRevenueShare()).toString() + "%");
    
    const stats = await clubToken.getClubStats();
    console.log("- Tokens sold:", stats._tokensSold.toString());
    console.log("- Sale active:", stats._saleActive);
    
    // Skip demo transactions on testnet to save gas
    if (hre.network.name === "hardhat") {
        // Demo purchase (buy 10 tokens)
        console.log("\n💰 Demo: Buying 10 tokens...");
        const buyAmount = 10;
        const cost = customPrice * BigInt(buyAmount);
        
        const buyTx = await clubToken.buyTokens(buyAmount, { value: cost });
        await buyTx.wait();
        
        console.log("✅ Purchased", buyAmount, "tokens for", ethers.formatEther(cost), "CHZ");
        console.log("- Token balance:", ethers.formatEther(await clubToken.balanceOf(deployer.address)));
        
        // Demo revenue distribution
        console.log("\n💸 Demo: Distributing revenue...");
        const revenue = ethers.parseEther("0.1"); // 0.1 CHZ revenue
        
        const distributeTx = await clubToken.distributeRevenue({ value: revenue });
        await distributeTx.wait();
        
        console.log("✅ Distributed", ethers.formatEther(revenue), "CHZ revenue");
        
        const claimable = await clubToken.getClaimableRevenue(deployer.address);
        console.log("- Claimable by fan:", ethers.formatEther(claimable), "CHZ");
        
        // Demo governance
        console.log("\n🗳️  Demo: Creating governance proposal...");
        const proposalTx = await clubToken.createProposal("Hire new head coach for 2025 season");
        await proposalTx.wait();
        
        const proposal = await clubToken.getProposal(1);
        console.log("✅ Proposal created:");
        console.log("- ID:", proposal.id.toString());
        console.log("- Description:", proposal.description);
        console.log("- Deadline:", new Date(Number(proposal.deadline) * 1000).toLocaleString());
    } else {
        console.log("\n⚡ Skipping demo transactions on testnet to save gas");
    }
    
    console.log("\n🎉 Deployment Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Factory Address:    ", await factory.getAddress());
    console.log("FC Montreuil Token: ", tokenAddress);
    console.log("Network:            ", hre.network.name);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("\n📝 Next steps for demo:");
    console.log("1. More fans can buy tokens with: clubToken.buyTokens()");
    console.log("2. Send revenue with: clubToken.distributeRevenue()");
    console.log("3. Fans claim dividends with: clubToken.claimRevenue()");
    console.log("4. Create proposals with: clubToken.createProposal()");
    console.log("5. Vote on proposals with: clubToken.vote()");
    
    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        factory: await factory.getAddress(),
        demoClub: {
            name: clubName,
            token: tokenAddress,
            price: ethers.formatEther(customPrice)
        },
        timestamp: new Date().toISOString()
    };
    
    console.log("\n💾 Deployment info saved for frontend integration");
    
    return deploymentInfo;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Erreur lors du déploiement:", error);
      process.exit(1);
    });
}

module.exports = main;