const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying FanStock Factory ONLY to", hre.network.name);
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "CHZ");
    
    // Check if we have enough balance
    const estimatedGas = ethers.parseEther("3"); // Rough estimate for factory deployment
    if (balance < estimatedGas) {
        console.log("⚠️  WARNING: Low balance! You have", ethers.formatEther(balance), "CHZ");
        console.log("   Estimated needed:", ethers.formatEther(estimatedGas), "CHZ");
        console.log("\n💡 Get testnet CHZ from: https://faucet.chiliz.com/");
        return;
    }

    // Deploy FanStockFactory only
    console.log("\n📦 Deploying FanStockFactory...");
    const FanStockFactory = await ethers.getContractFactory("FanStockFactory");
    const factory = await FanStockFactory.deploy();
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("✅ FanStockFactory deployed to:", factoryAddress);
    
    // Get factory info
    const defaultPrice = await factory.defaultTokenPrice();
    const factoryFee = await factory.factoryFee();
    
    console.log("\n📊 Factory configuration:");
    console.log("- Default token price:", ethers.formatEther(defaultPrice), "CHZ");
    console.log("- Factory fee:", ethers.formatEther(factoryFee), "CHZ");
    
    console.log("\n🎉 Deployment Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Factory Address:", factoryAddress);
    console.log("Network:        ", hre.network.name);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (hre.network.name === "chilizTestnet") {
        console.log("\n🔗 View on Explorer:");
        console.log(`https://testnet.chiliscan.com/address/${factoryAddress}`);
    }
    
    console.log("\n📝 Next steps:");
    console.log("1. Save the factory address for frontend integration");
    console.log("2. Create clubs via factory.createClubToken()");
    console.log("3. Each club gets its own token contract");
    
    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        factory: factoryAddress,
        defaultPrice: ethers.formatEther(defaultPrice),
        factoryFee: ethers.formatEther(factoryFee),
        timestamp: new Date().toISOString()
    };
    
    console.log("\n💾 Deployment info:", JSON.stringify(deploymentInfo, null, 2));
    
    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });