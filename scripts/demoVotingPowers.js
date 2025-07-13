const { ethers } = require("hardhat");
const { calculateTokenPrice } = require('./updatePriceFromAPI');

async function main() {
    console.log("🏆 Démonstration : Clubs avec différents pouvoirs de vote\n");
    
    const [deployer] = await ethers.getSigners();
    const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Factory déployée
    
    const Factory = await ethers.getContractFactory("FanStockFactory");
    const factory = Factory.attach(factoryAddress);
    
    const factoryFee = await factory.factoryFee();
    
    // Différents clubs avec différents modèles de gouvernance et revenus
    const clubs = [
        { 
            name: "FC Généreux", 
            symbol: "FCG", 
            price: 1.0,
            fanVotingPower: 49,
            fanRevenueShare: 15,
            description: "Maximum partage : 49% votes + 15% revenus"
        },
        { 
            name: "AS Équilibre", 
            symbol: "ASE", 
            price: 1.0,
            fanVotingPower: 40,
            fanRevenueShare: 10,
            description: "Modèle équilibré : 40% votes + 10% revenus"
        },
        { 
            name: "US Prudence", 
            symbol: "USP", 
            price: 1.0,
            fanVotingPower: 25,
            fanRevenueShare: 5,
            description: "Modèle conservateur : 25% votes + 5% revenus"
        },
        { 
            name: "CS Minimal", 
            symbol: "CSM", 
            price: 1.0,
            fanVotingPower: 10,
            fanRevenueShare: 0,
            description: "Minimum légal : 10% votes + 0% revenus"
        }
    ];
    
    console.log("📊 Modèles de gouvernance disponibles:\n");
    
    for (const club of clubs) {
        console.log(`${club.name} - ${club.description}`);
        console.log(`├─ Fans: ${club.fanVotingPower}% des votes + ${club.fanRevenueShare}% des revenus`);
        console.log(`└─ Club: ${100 - club.fanVotingPower}% des votes + veto + ${100 - club.fanRevenueShare}% des revenus`);
        console.log();
    }
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const createClubs = await prompt("Voulez-vous créer ces clubs de démonstration ? (o/n) ");
    
    if (createClubs.toLowerCase() !== 'o') {
        console.log("Annulé.");
        return;
    }
    
    console.log("\n🚀 Création des clubs...");
    
    for (const club of clubs) {
        try {
            console.log(`\n📍 Création de ${club.name}...`);
            
            const priceInChz = await calculateTokenPrice(club.price);
            
            const tx = await factory.createClubToken(
                club.name,
                `${club.name} Fan Token`,
                club.symbol,
                deployer.address,
                priceInChz,
                club.fanVotingPower,
                club.fanRevenueShare,
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
            
            console.log(`✅ ${club.name} créé à l'adresse: ${tokenAddress}`);
            
        } catch (error) {
            console.error(`❌ Erreur pour ${club.name}:`, error.message);
        }
    }
    
    console.log("\n🎯 Points clés pour le pitch:");
    console.log("1. Le club CHOISIT le niveau de démocratie (10-49% votes)");
    console.log("2. Le club CHOISIT le partage des revenus (0-15% aux fans)");
    console.log("3. Club garde toujours le veto (sécurité)");
    console.log("4. Flexibilité totale vs Socios (0% partout)");
    console.log("5. 4 modèles types : Généreux, Équilibré, Prudent, Minimal");
}

// Simple prompt function
function prompt(question) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        readline.question(question, (answer) => {
            readline.close();
            resolve(answer);
        });
    });
}

main().catch(console.error);