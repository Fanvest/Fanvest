const { ethers } = require("hardhat");
const { calculateTokenPrice } = require('./updatePriceFromAPI');

async function main() {
    console.log("🏆 Création de plusieurs clubs avec différents prix\n");
    
    const [deployer] = await ethers.getSigners();
    const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Votre factory
    
    const Factory = await ethers.getContractFactory("FanStockFactory");
    const factory = Factory.attach(factoryAddress);
    
    const factoryFee = await factory.factoryFee();
    
    // Différents clubs avec différents prix
    const clubs = [
        { name: "FC Montreuil", symbol: "FCM", price: 1.0 },      // 1€
        { name: "AS Bagnolet", symbol: "ASB", price: 0.5 },      // 50 centimes
        { name: "ES Bobigny", symbol: "ESB", price: 2.0 },       // 2€
        { name: "FC Vincennes", symbol: "FCV", price: 1.5 }      // 1.50€
    ];
    
    console.log("📊 Calcul des prix en CHZ...");
    for (const club of clubs) {
        const priceInChz = await calculateTokenPrice(club.price);
        club.priceInChz = priceInChz;
        console.log(`- ${club.name}: €${club.price} = ${ethers.formatEther(priceInChz)} CHZ`);
    }
    
    console.log("\n🚀 Création des clubs...");
    
    for (const club of clubs) {
        try {
            console.log(`\n📍 Création de ${club.name}...`);
            
            const tx = await factory.createClubToken(
                club.name,
                `${club.name} Fan Token`,
                club.symbol,
                deployer.address,
                club.priceInChz,
                { value: factoryFee }
            );
            
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => {
                try {
                    return factory.interface.parseLog(log).name === 'ClubTokenCreated';
                } catch {
                    return false;
                }
            });
            
            const tokenAddress = event ? factory.interface.parseLog(event).args[1] : "N/A";
            
            console.log(`✅ ${club.name} créé:`);
            console.log(`   Token: ${tokenAddress}`);
            console.log(`   Prix: €${club.price} (${ethers.formatEther(club.priceInChz)} CHZ)`);
            
        } catch (error) {
            console.error(`❌ Erreur pour ${club.name}:`, error.message);
        }
    }
    
    // Statistiques finales
    const totalClubs = await factory.getTotalClubs();
    console.log(`\n🎉 Total clubs créés: ${totalClubs}`);
    
    console.log("\n📝 Pour la démo, vous pouvez maintenant:");
    console.log("1. Montrer différents clubs avec différents prix");
    console.log("2. Démontrer l'accessibilité (50 centimes vs 2€)");
    console.log("3. Comparer avec Socios (20€+ pour les gros clubs)");
}

main().catch(console.error);