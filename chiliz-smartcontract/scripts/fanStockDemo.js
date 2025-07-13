const { ethers } = require("hardhat");

async function main() {
  console.log("🏆 FANSTOCK DEMO - Révolution du Football Amateur\n");

  // Déploiement
  console.log("📦 ÉTAPE 1: Création du club FC Montreuil");
  const [clubOwner, fan1, fan2, fan3, sponsor] = await ethers.getSigners();

  const clubInfo = {
    name: "FC Montreuil",
    location: "Montreuil, France", 
    foundedYear: 1985,
    league: "Division d'Honneur Régionale"
  };

  const tokenSale = {
    pricePerToken: ethers.parseEther("1"), // 1 CHZ = 1 token
    maxSupply: 10000,
    soldTokens: 0,
    saleActive: true,
    minPurchase: 1,
    maxPurchase: 500
  };

  const revenueShare = {
    playerSalesShare: 20,
    sponsorshipShare: 15, 
    tournamentShare: 25,
    totalRevenue: 0,
    totalDistributed: 0
  };

  const FanStockToken = await ethers.getContractFactory("FanStockToken");
  const fanStock = await FanStockToken.deploy(
    "FC Montreuil Token",
    "FCM", 
    clubInfo,
    tokenSale,
    revenueShare
  );
  await fanStock.waitForDeployment();

  console.log("✅ Club créé:", clubInfo.name);
  console.log("📍 Contrat déployé:", await fanStock.getAddress());
  console.log("💰 Prix par token:", ethers.formatEther(tokenSale.pricePerToken), "CHZ");
  console.log("🎯 Max supply:", tokenSale.maxSupply, "tokens\n");

  // Les fans achètent des tokens
  console.log("📦 ÉTAPE 2: Les fans locaux achètent des tokens");
  
  console.log("🏠 Fan local 1 achète 50 tokens (50 CHZ)");
  await fanStock.connect(fan1).buyTokens(50, { 
    value: ethers.parseEther("50") 
  });
  
  console.log("🏠 Fan local 2 achète 30 tokens (30 CHZ)");
  await fanStock.connect(fan2).buyTokens(30, { 
    value: ethers.parseEther("30") 
  });
  
  console.log("🏠 Fan local 3 achète 20 tokens (20 CHZ)");  
  await fanStock.connect(fan3).buyTokens(20, {
    value: ethers.parseEther("20")
  });

  const saleInfo = await fanStock.getTokenSaleInfo();
  console.log("✅ Total vendu:", saleInfo.soldTokens.toString(), "tokens");
  console.log("💰 Fonds levés:", ethers.formatEther(ethers.parseEther("100")), "CHZ");
  
  console.log("👥 Balances des fans:");
  console.log("   Fan 1:", ethers.formatEther(await fanStock.balanceOf(fan1.address)), "tokens");
  console.log("   Fan 2:", ethers.formatEther(await fanStock.balanceOf(fan2.address)), "tokens");  
  console.log("   Fan 3:", ethers.formatEther(await fanStock.balanceOf(fan3.address)), "tokens\n");

  // Gouvernance en action
  console.log("📦 ÉTAPE 3: Gouvernance démocratique");
  
  console.log("🗳️  Le club propose: 'Acheter nouveaux maillots'");
  await fanStock.createProposal(
    "Nouveaux maillots équipe première",
    "Remplacer les maillots usagés par des nouveaux avec sponsor local",
    0, // EQUIPMENT_PURCHASE
    ethers.parseEther("15"), // 15 CHZ
    "Maillots Nike, couleur rouge et blanc traditionnelle",
    7 // 7 jours de vote
  );

  console.log("🗳️  Le club propose: 'Embaucher entraîneur youth'");
  await fanStock.createProposal(
    "Entraîneur pour équipe U15",
    "Recruter un entraîneur diplômé pour développer les jeunes talents",
    0, // COACH_HIRING  
    ethers.parseEther("25"), // 25 CHZ/mois
    "Entraîneur avec licence UEFA B minimum",
    7
  );

  console.log("✅ Propositions créées!\n");

  // Les fans votent
  console.log("📦 ÉTAPE 4: Les fans votent sur les propositions");
  
  console.log("✅ Fan 1 (50 tokens) vote POUR les nouveaux maillots");
  await fanStock.connect(fan1).voteOnProposal(1, true);
  
  console.log("✅ Fan 2 (30 tokens) vote POUR les nouveaux maillots"); 
  await fanStock.connect(fan2).voteOnProposal(1, true);
  
  console.log("❌ Fan 3 (20 tokens) vote CONTRE les nouveaux maillots");
  await fanStock.connect(fan3).voteOnProposal(1, false);

  console.log("✅ Fan 1 vote POUR l'entraîneur youth");
  await fanStock.connect(fan1).voteOnProposal(2, true);
  
  console.log("❌ Fan 2 vote CONTRE l'entraîneur youth");
  await fanStock.connect(fan2).voteOnProposal(2, false);

  const results1 = await fanStock.getProposalResults(1);
  const results2 = await fanStock.getProposalResults(2);
  
  console.log("\n📊 RÉSULTATS DES VOTES:");
  console.log("👕 Maillots:", ethers.formatEther(results1.votesFor), "pour vs", ethers.formatEther(results1.votesAgainst), "contre");
  console.log("👨‍🏫 Entraîneur:", ethers.formatEther(results2.votesFor), "pour vs", ethers.formatEther(results2.votesAgainst), "contre\n");

  // Revenus du club  
  console.log("📦 ÉTAPE 5: Revenus et partage");
  
  console.log("💰 Sponsoring local reçu: 500 CHZ");
  await fanStock.addRevenue("Sponsoring boulangerie locale", ethers.parseEther("500"));
  
  console.log("🏆 Gain tournoi régional: 200 CHZ");
  await fanStock.addRevenue("Victoire Coupe Régionale", ethers.parseEther("200"));
  
  console.log("⚽ Vente joueur en academy: 1000 CHZ");
  await fanStock.addRevenue("Transfer jeune vers club pro", ethers.parseEther("1000"));

  const revenueInfo = await fanStock.getRevenueInfo();
  console.log("✅ Total revenus club:", ethers.formatEther(revenueInfo.totalRevenue), "CHZ");

  // Distribution dividendes
  console.log("💸 Distribution des dividendes aux détenteurs...");
  await fanStock.distributeDividends();
  
  console.log("💎 Dividendes disponibles:");
  const div1 = await fanStock.calculateDividends(fan1.address);
  const div2 = await fanStock.calculateDividends(fan2.address); 
  const div3 = await fanStock.calculateDividends(fan3.address);
  
  console.log("   Fan 1 (50 tokens):", ethers.formatEther(div1), "CHZ");
  console.log("   Fan 2 (30 tokens):", ethers.formatEther(div2), "CHZ");
  console.log("   Fan 3 (20 tokens):", ethers.formatEther(div3), "CHZ\n");

  console.log("📦 ÉTAPE 6: Récapitulatif FanStock");
  console.log("🏆 RÉSULTATS:");
  console.log("   💰 Fonds levés:", ethers.formatEther(ethers.parseEther("100")), "CHZ");
  console.log("   📊 Revenus générés:", ethers.formatEther(revenueInfo.totalRevenue), "CHZ");
  console.log("   👥 Détenteurs:", "3 fans locaux");
  console.log("   🗳️  Propositions:", "2 votes démocratiques"); 
  console.log("   💸 Dividendes:", "Répartis proportionnellement");

  console.log("\n🚀 POURQUOI FANSTOCK RÉVOLUTIONNE LE FOOTBALL AMATEUR:");
  console.log("   ✅ Financement participatif accessible (1 CHZ minimum)");
  console.log("   ✅ Vraie propriété et gouvernance démocratique");
  console.log("   ✅ Retour sur investissement via dividendes");
  console.log("   ✅ Transparence totale des finances du club");
  console.log("   ✅ Engagement communautaire renforcé");
  console.log("   ✅ Technologie Chiliz éprouvée, nouveau marché\n");

  console.log("🎯 Prêt pour le hackathon Chiliz ! 🏆");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}

module.exports = main;