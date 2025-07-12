const hre = require("hardhat");

async function main() {
  console.log("🚀 Déploiement simple sur Chiliz Spicy...\n");

  // Paramètres ultra-simples
  const name = "Test Fan Token";
  const symbol = "TEST";
  const supply = 1000000;
  const clubName = "Test Club";
  const description = "Test token";
  
  // Utiliser votre propre adresse comme owner
  const [deployer] = await hre.ethers.getSigners();
  const owner = await deployer.getAddress();
  
  console.log(`📍 Déploiement depuis: ${owner}`);
  console.log(`💰 Solde: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(owner))} CHZ\n`);

  // Déploiement avec paramètres minimaux
  const FanToken = await hre.ethers.getContractFactory("FanToken");
  
  console.log("⏳ Déploiement...");
  
  const fanToken = await FanToken.deploy(
    name,
    symbol, 
    supply,
    clubName,
    description,
    owner
    // Pas de paramètres gas - laisser Hardhat gérer
  );

  console.log("⏳ Attente confirmation...");
  await fanToken.waitForDeployment();
  
  const address = await fanToken.getAddress();
  console.log("✅ Déployé!");
  console.log(`📍 Adresse: ${address}`);
  console.log(`🔗 Explorer: https://spicy-explorer.chiliz.com/address/${address}`);
}

main().catch(console.error);
