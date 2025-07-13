const { ethers } = require("hardhat");
const fetch = require('node-fetch'); // npm install node-fetch@2

async function fetchChzPrice() {
    try {
        // CoinGecko API pour obtenir le prix CHZ/EUR
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=chiliz&vs_currencies=eur');
        const data = await response.json();
        
        const chzPriceEur = data.chiliz?.eur;
        if (!chzPriceEur) {
            throw new Error("Prix CHZ non trouvé");
        }
        
        console.log(`📊 Prix actuel CHZ: €${chzPriceEur}`);
        
        // Convertir en centimes pour éviter les décimales dans le smart contract
        const priceInCents = Math.round(chzPriceEur * 100);
        console.log(`💰 Prix en centimes: ${priceInCents} (${priceInCents/100} EUR)`);
        
        return priceInCents;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du prix:", error.message);
        
        // Prix de fallback (environ 0.06 EUR = 6 centimes)
        console.log("🔄 Utilisation du prix de fallback: 6 centimes (0.06 EUR)");
        return 6;
    }
}

async function calculateTokenPrice(eurPrice = 1.0) {
    const chzPriceInCents = await fetchChzPrice();
    const chzPriceInEur = chzPriceInCents / 100;
    
    // Calculer combien de CHZ pour 1 EUR
    const chzNeededForOneEur = eurPrice / chzPriceInEur;
    const chzInWei = ethers.parseEther(chzNeededForOneEur.toString());
    
    console.log(`\n💡 Calcul pour un token à €${eurPrice}:`);
    console.log(`- Prix CHZ: €${chzPriceInEur}`);
    console.log(`- CHZ nécessaires: ${chzNeededForOneEur.toFixed(4)}`);
    console.log(`- En wei: ${chzInWei.toString()}`);
    
    return chzInWei;
}

async function updateFactoryPrice() {
    try {
        const [deployer] = await ethers.getSigners();
        
        // Adresse de votre factory déployée
        const factoryAddress = process.env.FACTORY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        
        const Factory = await ethers.getContractFactory("FanStockFactory");
        const factory = Factory.attach(factoryAddress);
        
        // Calculer le nouveau prix pour 1 EUR
        const newPrice = await calculateTokenPrice(1.0);
        
        console.log("\n🔄 Mise à jour du prix par défaut...");
        const tx = await factory.updateDefaultTokenPrice(newPrice);
        await tx.wait();
        
        console.log("✅ Prix mis à jour dans la Factory!");
        
        const updatedPrice = await factory.defaultTokenPrice();
        console.log("📊 Nouveau prix par défaut:", ethers.formatEther(updatedPrice), "CHZ");
        
    } catch (error) {
        console.error("❌ Erreur:", error.message);
    }
}

async function main() {
    console.log("🌐 Récupération du prix CHZ/EUR en temps réel\n");
    
    // Option 1: Juste calculer les prix
    console.log("=== CALCULS DE PRIX ===");
    await calculateTokenPrice(1.0);   // Token à 1 EUR
    await calculateTokenPrice(0.5);   // Token à 0.50 EUR
    await calculateTokenPrice(2.0);   // Token à 2 EUR
    
    // Option 2: Mettre à jour la factory (décommentez si vous voulez vraiment l'exécuter)
    // console.log("\n=== MISE À JOUR FACTORY ===");
    // await updateFactoryPrice();
}

// Fonctions exportées pour utilisation dans d'autres scripts
module.exports = {
    fetchChzPrice,
    calculateTokenPrice,
    updateFactoryPrice
};

if (require.main === module) {
    main().catch(console.error);
}