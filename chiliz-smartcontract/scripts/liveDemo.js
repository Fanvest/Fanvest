const { ethers } = require("hardhat");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

async function main() {
    console.log("\n🎪 FANSTOCK LIVE DEMO - Hacking Paris 2025\n");
    
    const [deployer, fan1, fan2, fan3] = await ethers.getSigners();
    
    // Assume contracts are already deployed
    const factoryAddress = process.env.FACTORY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const tokenAddress = process.env.TOKEN_ADDRESS || "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";
    
    const ClubToken = await ethers.getContractFactory("ClubToken");
    const clubToken = ClubToken.attach(tokenAddress);
    
    while (true) {
        console.log("\n=== FANSTOCK DEMO MENU ===");
        console.log("1. 💰 Acheter des tokens (Fan)");
        console.log("2. 💸 Envoyer des revenus au club");
        console.log("3. 🎯 Réclamer mes dividendes");
        console.log("4. 🗳️  Créer une proposition");
        console.log("5. ✅ Voter sur une proposition");
        console.log("6. 🚫 Club : Utiliser le veto");
        console.log("7. 📊 Voir les stats du club");
        console.log("8. 👥 Voir mes tokens et revenus");
        console.log("9. ❌ Quitter\n");
        
        const choice = await prompt("Choisissez une option (1-9): ");
        
        try {
            switch(choice) {
                case '1':
                    await buyTokensDemo(clubToken, fan1);
                    break;
                case '2':
                    await sendRevenueDemo(clubToken, deployer);
                    break;
                case '3':
                    await claimRevenueDemo(clubToken, fan1);
                    break;
                case '4':
                    await createProposalDemo(clubToken, fan1);
                    break;
                case '5':
                    await voteDemo(clubToken, fan1);
                    break;
                case '6':
                    await vetoDemo(clubToken, deployer);
                    break;
                case '7':
                    await showStats(clubToken);
                    break;
                case '8':
                    await showMyBalance(clubToken, fan1);
                    break;
                case '9':
                    console.log("\n👋 Merci pour la démo FanStock !");
                    rl.close();
                    return;
                default:
                    console.log("❌ Option invalide");
            }
        } catch (error) {
            console.error("❌ Erreur:", error.message);
        }
        
        await prompt("\nAppuyez sur Entrée pour continuer...");
    }
}

async function buyTokensDemo(clubToken, fan) {
    const amount = await prompt("Combien de tokens voulez-vous acheter ? (1-100): ");
    const tokenAmount = parseInt(amount);
    
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
        console.log("❌ Montant invalide");
        return;
    }
    
    const price = await clubToken.tokenPrice();
    const cost = price * BigInt(tokenAmount);
    
    console.log(`\n💳 Coût total: ${ethers.formatEther(cost)} CHZ`);
    console.log("⏳ Achat en cours...");
    
    const tx = await clubToken.connect(fan).buyTokens(tokenAmount, { value: cost });
    await tx.wait();
    
    console.log(`✅ ${tokenAmount} tokens achetés avec succès !`);
    
    const balance = await clubToken.balanceOf(fan.address);
    console.log(`📊 Votre solde: ${ethers.formatEther(balance)} tokens`);
}

async function sendRevenueDemo(clubToken, sender) {
    const amount = await prompt("Montant des revenus à distribuer (en CHZ): ");
    const revenue = ethers.parseEther(amount);
    
    console.log("\n💰 Distribution des revenus:");
    console.log(`- Total: ${amount} CHZ`);
    console.log(`- Part des fans (10%): ${ethers.formatEther(revenue / 10n)} CHZ`);
    console.log(`- Part du club (90%): ${ethers.formatEther(revenue * 9n / 10n)} CHZ`);
    
    console.log("⏳ Distribution en cours...");
    
    const tx = await clubToken.connect(sender).distributeRevenue({ value: revenue });
    await tx.wait();
    
    console.log("✅ Revenus distribués !");
}

async function claimRevenueDemo(clubToken, fan) {
    const claimable = await clubToken.getClaimableRevenue(fan.address);
    
    if (claimable === 0n) {
        console.log("❌ Aucun revenu à réclamer");
        return;
    }
    
    console.log(`\n💎 Revenus disponibles: ${ethers.formatEther(claimable)} CHZ`);
    console.log("⏳ Réclamation en cours...");
    
    const tx = await clubToken.connect(fan).claimRevenue();
    await tx.wait();
    
    console.log("✅ Revenus réclamés !");
}

async function createProposalDemo(clubToken, proposer) {
    console.log("\n📝 Exemples de propositions:");
    console.log("1. Recruter un nouveau coach");
    console.log("2. Rénover les vestiaires");
    console.log("3. Créer une école de football U12");
    console.log("4. Acheter un nouveau bus pour l'équipe");
    
    const description = await prompt("\nDescription de votre proposition: ");
    
    console.log("⏳ Création de la proposition...");
    
    const tx = await clubToken.connect(proposer).createProposal(description);
    await tx.wait();
    
    const proposalCount = await clubToken.proposalCount();
    console.log(`✅ Proposition #${proposalCount} créée !`);
    console.log("🗳️  Les fans peuvent maintenant voter pendant 7 jours");
}

async function voteDemo(clubToken, voter) {
    const proposalId = await prompt("ID de la proposition: ");
    const support = await prompt("Voter POUR (o/n)? ");
    
    const vote = support.toLowerCase() === 'o';
    
    console.log(`⏳ Vote ${vote ? 'POUR' : 'CONTRE'} en cours...`);
    
    const tx = await clubToken.connect(voter).vote(parseInt(proposalId), vote);
    await tx.wait();
    
    console.log("✅ Vote enregistré !");
    
    // Show current results
    const proposal = await clubToken.getProposal(proposalId);
    console.log(`\n📊 Résultats actuels:`);
    console.log(`- Pour: ${proposal.forVotes} votes`);
    console.log(`- Contre: ${proposal.againstVotes} votes`);
}

async function vetoDemo(clubToken, club) {
    const proposalId = await prompt("ID de la proposition à bloquer: ");
    
    console.log("⏳ Veto en cours...");
    
    const tx = await clubToken.connect(club).clubVeto(parseInt(proposalId));
    await tx.wait();
    
    console.log("🚫 Proposition bloquée par le club !");
}

async function showStats(clubToken) {
    const stats = await clubToken.getClubStats();
    const clubName = await clubToken.clubName();
    
    console.log(`\n📊 Statistiques de ${clubName}:`);
    console.log(`- Tokens vendus: ${stats._tokensSold}/10000`);
    console.log(`- Revenus totaux: ${ethers.formatEther(stats._totalRevenue)} CHZ`);
    console.log(`- Revenus distribués: ${ethers.formatEther(stats._totalDistributed)} CHZ`);
    console.log(`- Propositions créées: ${stats._proposalCount}`);
    console.log(`- Vente active: ${stats._saleActive ? '✅' : '❌'}`);
}

async function showMyBalance(clubToken, fan) {
    const balance = await clubToken.balanceOf(fan.address);
    const claimable = await clubToken.getClaimableRevenue(fan.address);
    
    console.log("\n👤 Mes informations:");
    console.log(`- Adresse: ${fan.address}`);
    console.log(`- Tokens: ${ethers.formatEther(balance)}`);
    console.log(`- Revenus à réclamer: ${ethers.formatEther(claimable)} CHZ`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});