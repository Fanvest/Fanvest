const hre = require("hardhat");

async function setupSpicy() {
  console.log("🔧 Configuration Chiliz Spicy Testnet\n");
  
  try {
    // Vérifier la connexion au réseau
    const network = await hre.ethers.provider.getNetwork();
    console.log(`🌐 Réseau connecté: ${network.name} (ChainID: ${network.chainId})`);
    
    if (network.chainId !== 88882n) {
      console.log("❌ Vous n'êtes pas sur Spicy Testnet!");
      return;
    }
    
    // Récupérer l'adresse du wallet
    const [deployer] = await hre.ethers.getSigners();
    const address = await deployer.getAddress();
    
    console.log(`📍 Votre adresse: ${address}`);
    
    // Vérifier le solde
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceInCHZ = hre.ethers.formatEther(balance);
    
    console.log(`💰 Solde actuel: ${balanceInCHZ} CHZ\n`);
    
    if (parseFloat(balanceInCHZ) < 0.01) {
      console.log("🚰 Vous avez besoin de CHZ de test!");
      console.log("\n📋 Étapes pour obtenir des CHZ:");
      console.log("1. Ajoutez Spicy à MetaMask:");
      console.log("   - Réseau: Chiliz Spicy Testnet");
      console.log("   - RPC: https://spicy-rpc.chiliz.com/");
      console.log("   - ChainID: 88882");
      console.log("   - Symbole: CHZ");
      console.log("   - Explorer: https://spicy-explorer.chiliz.com/");
      
      console.log("\n2. Utilisez un faucet:");
      console.log("   - Spicy Faucet: https://spicy-faucet.chiliz.com/");
      console.log("   - Tatum Faucet: https://faucet.tatum.io/chiliz-testnet");
      
      console.log("\n3. Vérifiez sur l'explorer:");
      console.log(`   - https://spicy-explorer.chiliz.com/address/${address}`);
      
    } else {
      console.log("✅ Solde suffisant pour déployer!");
      console.log("\n🚀 Vous pouvez maintenant déployer:");
      console.log("   npm run deploy:spicy2");
    }
    
    // Test de connectivité
    console.log("\n🔍 Test de connectivité...");
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(`📦 Dernier bloc: ${blockNumber}`);
    console.log("✅ Connexion au réseau OK!");
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    
    if (error.message.includes("invalid private key")) {
      console.log("\n💡 Problème avec votre clé privée:");
      console.log("   - Vérifiez le fichier .env");
      console.log("   - La clé doit faire 64 caractères hexadécimaux");
      console.log("   - Pas de préfixe 0x");
    }
  }
}

setupSpicy();
