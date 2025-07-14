const { ethers } = require("hardhat");

async function main() {
  console.log("Starting simple Fanvest Factory deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CHZ");
  
  if (balance < ethers.parseEther("0.1")) {
    console.log("❌ Insufficient CHZ balance for deployment");
    console.log("Please visit https://spicy-faucet.chiliz.com/ to get testnet CHZ");
    return;
  }

  // Deploy Factory only
  console.log("\nDeploying FanStockFactory...");
  const FanStockFactory = await ethers.getContractFactory("FanStockFactory");
  
  // Lower gas estimates
  const factory = await FanStockFactory.deploy({
    gasLimit: 3000000,
    gasPrice: ethers.parseUnits("25", "gwei")
  });
  
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ FanStockFactory deployed to:", factoryAddress);

  // Basic verification
  const factoryFee = await factory.factoryFee();
  console.log("Factory fee:", ethers.formatEther(factoryFee), "CHZ");
  
  console.log("\n🎉 Factory deployed successfully!");
  console.log("Update your frontend with this address:", factoryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });