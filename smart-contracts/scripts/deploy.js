const hre = require("hardhat");

async function main() {
  console.log("🚀 Déploiement du template FanToken sur Chiliz Spicy...\n");

  // Paramètres du token (à modifier pour chaque club)
  const tokenParams = {
    name: "Exemple Club Fan Token",           // Nom complet du token
    symbol: "EXEMPLE",                        // Symbole (3-5 lettres)
    initialSupply: 1000000,                   // Supply initial (1 million)
    clubName: "Exemple Football Club",        // Nom du club
    clubDescription: "Club de football émergent cherchant à monter en pro",
    owner: "0xe1DD80637F288CAeC7482D11a2B04580bfc6855C" // Adresse du wallet du club (à remplacer)
  };

  // Vérification que l'adresse owner est définie
  if (tokenParams.owner === "0x...") {
    console.error("❌ Erreur: Vous devez définir l'adresse du propriétaire dans tokenParams.owner");
    console.log("💡 Remplacez '0x...' par l'adresse wallet du club");
    return;
  }

  console.log("📋 Paramètres du token:");
  console.log(`   Nom: ${tokenParams.name}`);
  console.log(`   Symbole: ${tokenParams.symbol}`);
  console.log(`   Supply: ${tokenParams.initialSupply.toLocaleString()}`);
  console.log(`   Club: ${tokenParams.clubName}`);
  console.log(`   Propriétaire: ${tokenParams.owner}\n`);

  // Déploiement
  const FanToken = await hre.ethers.getContractFactory("FanToken");
  
  console.log("⏳ Déploiement en cours...");
  
  const fanToken = await FanToken.deploy(
    tokenParams.name,
    tokenParams.symbol,
    tokenParams.initialSupply,
    tokenParams.clubName,
    tokenParams.clubDescription,
    tokenParams.owner,
    { 
      gasLimit: 1500000, // Réduit pour économiser
      gasPrice: hre.ethers.parseUnits("1", "gwei") // 1 gwei explicite
    }
  );

  await fanToken.waitForDeployment();
  const contractAddress = await fanToken.getAddress();

  console.log("✅ Token déployé avec succès!");
  console.log(`📍 Adresse du contrat: ${contractAddress}`);
  console.log(`🔗 Explorer: https://spicy-explorer.chiliz.com/address/${contractAddress}`);
  
  // Vérification du déploiement
  console.log("\n🔍 Vérification du déploiement...");
  const deployedName = await fanToken.name();
  const deployedSymbol = await fanToken.symbol();
  const deployedSupply = await fanToken.totalSupply();
  
  console.log(`   Nom vérifié: ${deployedName}`);
  console.log(`   Symbole vérifié: ${deployedSymbol}`);
  console.log(`   Supply vérifié: ${hre.ethers.formatEther(deployedSupply)} tokens`);
  
  console.log("\n🎉 Déploiement terminé avec succès!");
  console.log("\n📝 Pour déployer un nouveau token pour un autre club:");
  console.log("   1. Modifiez les paramètres dans tokenParams");
  console.log("   2. Relancez: npm run deploy:spicy");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur lors du déploiement:", error);
    process.exit(1);
  });
