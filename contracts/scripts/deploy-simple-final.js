const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting simple Fanvest deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "CHZ");

  // Vérifier balance minimum
  if (balance < ethers.parseEther("0.5")) {
    console.log("❌ Insufficient balance. Need at least 0.5 CHZ");
    console.log("💡 Get CHZ from: https://spicy-faucet.chiliz.com/");
    return;
  }

  try {
    console.log("\n📦 Deploying FanStockFactory...");
    
    const FanStockFactory = await ethers.getContractFactory("FanStockFactory");
    
    // Déployer avec settings minimaux
    const factory = await FanStockFactory.deploy({
      gasLimit: 5000000,  // 5M gas limit
      gasPrice: ethers.parseUnits("25", "gwei")  // 25 Gwei
    });
    
    console.log("⏳ Waiting for deployment...");
    await factory.waitForDeployment();
    
    const address = await factory.getAddress();
    console.log("✅ Deployed to:", address);
    
    // Test basique
    const fee = await factory.factoryFee();
    console.log("💸 Factory fee:", ethers.formatEther(fee), "CHZ");
    
    console.log("\n🎉 SUCCESS!");
    console.log("🔗 Factory address:", address);
    console.log("🌐 Explorer: https://testnet.chiliscan.com/address/" + address);
    
    console.log("\n📝 Update your frontend:");
    console.log("In lib/smart-contracts/token-factory.ts:");
    console.log(`[chilizSpicy.id]: '${address}',`);

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });