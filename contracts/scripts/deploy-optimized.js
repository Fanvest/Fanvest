const { ethers } = require("hardhat");

async function main() {
  console.log("Starting optimized Fanvest deployment...");
  
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.error("❌ No signers found. Please check your PRIVATE_KEY in .env file.");
    return;
  }
  
  const [deployer] = signers;
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CHZ");

  try {
    // Deploy Factory with optimized gas settings
    console.log("\n1. Deploying FanStockFactory with optimized gas...");
    const FanStockFactory = await ethers.getContractFactory("FanStockFactory");
    
    // Estimer le gas nécessaire
    const deployTx = await FanStockFactory.getDeployTransaction();
    const estimatedGas = await deployer.estimateGas(deployTx);
    console.log("Estimated gas:", estimatedGas.toString());
    
    // Utiliser des paramètres de gas conservateurs
    const gasLimit = estimatedGas * BigInt(120) / BigInt(100); // +20% de marge
    const gasPrice = await deployer.provider.getGasPrice();
    const adjustedGasPrice = gasPrice * BigInt(80) / BigInt(100); // -20% pour économiser
    
    console.log("Gas limit:", gasLimit.toString());
    console.log("Gas price:", ethers.formatUnits(adjustedGasPrice, "gwei"), "Gwei");
    
    const estimatedCost = gasLimit * adjustedGasPrice;
    console.log("Estimated cost:", ethers.formatEther(estimatedCost), "CHZ");
    
    if (balance < estimatedCost) {
      console.error("❌ Insufficient CHZ balance for deployment.");
      console.log("💡 Get testnet CHZ from: https://spicy-faucet.chiliz.com/");
      console.log(`💰 Current: ${ethers.formatEther(balance)} CHZ`);
      console.log(`💰 Needed: ${ethers.formatEther(estimatedCost)} CHZ`);
      return;
    }
    
    // Déployer avec les paramètres optimisés
    const factory = await FanStockFactory.deploy({
      gasLimit: gasLimit,
      gasPrice: adjustedGasPrice
    });
    
    console.log("⏳ Transaction sent, waiting for confirmation...");
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("✅ FanStockFactory deployed to:", factoryAddress);

    // Vérifier le déploiement
    console.log("\n2. Verifying deployment...");
    const factoryFee = await factory.factoryFee();
    console.log("Factory fee:", ethers.formatEther(factoryFee), "CHZ");
    console.log("Total clubs created:", await factory.totalClubsCreated());

    console.log("\n🎉 Deployment Summary:");
    console.log("✅ Factory Address:", factoryAddress);
    console.log("✅ Network: Chiliz Spicy Testnet (88882)");
    console.log("✅ Explorer: https://testnet.chiliscan.com/address/" + factoryAddress);
    
    console.log("\n📝 Next Steps:");
    console.log("1. Update lib/smart-contracts/token-factory.ts with new address:");
    console.log(`   [chilizSpicy.id]: '${factoryAddress}',`);
    console.log("2. Set NEXT_PUBLIC_DEMO_MODE=false to use real contracts");
    console.log("3. Test token creation through the UI");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solutions:");
      console.log("1. Get more CHZ from faucet: https://spicy-faucet.chiliz.com/");
      console.log("2. Wait for network congestion to decrease");
      console.log("3. Try again in a few minutes");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });