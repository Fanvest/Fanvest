const { ethers } = require("hardhat");

async function main() {
  console.log("Starting Fanvest deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "CHZ");

  // Deploy Factory
  console.log("\n1. Deploying FanStockFactory...");
  const FanStockFactory = await ethers.getContractFactory("FanStockFactory");
  const factory = await FanStockFactory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ FanStockFactory deployed to:", factoryAddress);

  // Verify deployment
  console.log("\n2. Verifying deployment...");
  const factoryFee = await factory.factoryFee();
  console.log("Factory fee:", ethers.formatEther(factoryFee), "CHZ");
  console.log("Total clubs created:", await factory.totalClubsCreated());

  // Create demo club token
  console.log("\n3. Creating demo club token...");
  const demoParams = {
    clubName: "FC Montreuil",
    tokenName: "FC Montreuil Fan Token",
    tokenSymbol: "FCMNT",
    clubWallet: deployer.address,
    customPrice: ethers.parseEther("0.001"), // 0.001 CHZ per token
    fanVotingPower: 40, // 40%
    fanRevenueShare: 10  // 10%
  };

  const createTx = await factory.createClubToken(
    demoParams.clubName,
    demoParams.tokenName,
    demoParams.tokenSymbol,
    demoParams.clubWallet,
    demoParams.customPrice,
    demoParams.fanVotingPower,
    demoParams.fanRevenueShare,
    { value: factoryFee }
  );
  
  console.log("Transaction sent:", createTx.hash);
  const receipt = await createTx.wait();
  console.log("Transaction confirmed!");

  // Find the ClubTokenCreated event
  const clubCreatedEvent = receipt.logs.find(log => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed && parsed.name === 'ClubTokenCreated';
    } catch (e) {
      return false;
    }
  });

  if (clubCreatedEvent) {
    const parsed = factory.interface.parseLog(clubCreatedEvent);
    const tokenAddress = parsed.args.tokenAddress;
    console.log("✅ Demo club token deployed to:", tokenAddress);

    // Test the token
    console.log("\n4. Testing demo token...");
    const ClubToken = await ethers.getContractFactory("ClubToken");
    const clubToken = ClubToken.attach(tokenAddress);
    
    const clubInfo = await clubToken.getClubInfo();
    console.log("Club name:", clubInfo.name);
    console.log("Token price:", ethers.formatEther(clubInfo.price), "CHZ");
    console.log("Fan voting power:", clubInfo.fanVoting + "%");
    console.log("Fan revenue share:", clubInfo.fanRevenue + "%");
  }

  console.log("\n🎉 Deployment Summary:");
  console.log("Factory Address:", factoryAddress);
  if (clubCreatedEvent) {
    const parsed = factory.interface.parseLog(clubCreatedEvent);
    console.log("Demo Token Address:", parsed.args.tokenAddress);
  }
  console.log("Network:", (await deployer.provider.getNetwork()).name);
  console.log("Chain ID:", (await deployer.provider.getNetwork()).chainId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });