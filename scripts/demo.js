const { ethers } = require("hardhat");

async function main() {
  console.log("🎯 DEMO COMPLÈTE DU FANTOKEN CHILIZ\n");

  // 1. Déploiement
  console.log("📦 ÉTAPE 1: Déploiement du contrat");
  const [owner, fan1, fan2] = await ethers.getSigners();
  
  const tokenName = "Paris Saint-Germain Fan Token";
  const tokenSymbol = "PSG";
  const clubName = "Paris Saint-Germain";

  const FanToken = await ethers.getContractFactory("FanToken");
  const fanToken = await FanToken.deploy(tokenName, tokenSymbol, clubName);
  await fanToken.waitForDeployment();

  const contractAddress = await fanToken.getAddress();
  console.log("✅ Contrat déployé à:", contractAddress);
  console.log("💰 Supply initial:", ethers.formatEther(await fanToken.totalSupply()), "tokens\n");

  // 2. Distribution initiale
  console.log("📦 ÉTAPE 2: Distribution des tokens aux fans");
  const transferAmount = ethers.parseEther("1000");
  
  await fanToken.transfer(fan1.address, transferAmount);
  await fanToken.transfer(fan2.address, transferAmount);
  
  console.log("✅ Fan 1 balance:", ethers.formatEther(await fanToken.balanceOf(fan1.address)), "tokens");
  console.log("✅ Fan 2 balance:", ethers.formatEther(await fanToken.balanceOf(fan2.address)), "tokens\n");

  // 3. Création d'un sondage
  console.log("📦 ÉTAPE 3: Création d'un sondage");
  const question = "Quel maillot préférez-vous pour la saison 2024-2025 ?";
  const options = [
    "Maillot domicile rouge classique", 
    "Maillot extérieur bleu marine", 
    "Maillot third blanc et or"
  ];
  
  await fanToken.createPoll(question, options, 48); // 48 heures
  const pollId = await fanToken.pollCounter();
  
  console.log("✅ Sondage créé! ID:", pollId.toString());
  console.log("❓ Question:", question);
  options.forEach((option, i) => console.log(`   ${i}: ${option}`));
  console.log();

  // 4. Votes des fans
  console.log("📦 ÉTAPE 4: Vote des fans");
  
  console.log("🗳️  Fan 1 vote pour l'option 0 (maillot rouge)");
  await fanToken.connect(fan1).vote(pollId, 0);
  
  console.log("🗳️  Fan 2 vote pour l'option 1 (maillot bleu)");
  await fanToken.connect(fan2).vote(pollId, 1);
  
  // Vérifier les points de fidélité
  console.log("⭐ Points de fidélité Fan 1:", (await fanToken.fanLoyaltyPoints(fan1.address)).toString());
  console.log("⭐ Points de fidélité Fan 2:", (await fanToken.fanLoyaltyPoints(fan2.address)).toString());
  console.log();

  // 5. Résultats du sondage
  console.log("📦 ÉTAPE 5: Résultats du sondage");
  const results = await fanToken.getPollResults(pollId);
  
  console.log("📊 RÉSULTATS FINAUX:");
  console.log("❓ Question:", results.question);
  for (let i = 0; i < results.options.length; i++) {
    const votes = ethers.formatEther(results.votes[i]);
    console.log(`   ${results.options[i]}: ${votes} votes`);
  }
  console.log("📈 Total votes:", ethers.formatEther(results.totalVotes));
  console.log();

  // 6. Distribution de récompenses
  console.log("📦 ÉTAPE 6: Distribution de récompenses");
  
  const rewardAmount1 = ethers.parseEther("100");
  const rewardAmount2 = ethers.parseEther("75");
  
  await fanToken.distributeReward(fan1.address, rewardAmount1, "Participation active au vote");
  await fanToken.distributeReward(fan2.address, rewardAmount2, "Premier vote sur la plateforme");
  
  console.log("🎁 Récompense distribuée à Fan 1:", ethers.formatEther(rewardAmount1), "tokens");
  console.log("🎁 Récompense distribuée à Fan 2:", ethers.formatEther(rewardAmount2), "tokens");
  console.log();

  // 7. Balances finales
  console.log("📦 ÉTAPE 7: Balances et points finaux");
  console.log("💰 Balance finale Fan 1:", ethers.formatEther(await fanToken.balanceOf(fan1.address)), "tokens");
  console.log("💰 Balance finale Fan 2:", ethers.formatEther(await fanToken.balanceOf(fan2.address)), "tokens");
  console.log("⭐ Points finaux Fan 1:", (await fanToken.fanLoyaltyPoints(fan1.address)).toString());
  console.log("⭐ Points finaux Fan 2:", (await fanToken.fanLoyaltyPoints(fan2.address)).toString());
  console.log();

  // 8. Test de burn
  console.log("📦 ÉTAPE 8: Test de burn de tokens");
  const burnAmount = ethers.parseEther("50");
  
  console.log("🔥 Fan 1 brûle 50 tokens pour bonus fidélité...");
  await fanToken.connect(fan1).burnTokens(burnAmount);
  
  console.log("💰 Nouvelle balance Fan 1:", ethers.formatEther(await fanToken.balanceOf(fan1.address)), "tokens");
  console.log("⭐ Points bonus Fan 1:", (await fanToken.fanLoyaltyPoints(fan1.address)).toString());
  console.log();

  console.log("🎉 DÉMO TERMINÉE AVEC SUCCÈS!");
  console.log("🏆 Le contrat FanToken est prêt pour le hackathon Chiliz!");
  
  return {
    contractAddress,
    tokenName,
    tokenSymbol,
    clubName
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Erreur lors de la démo:", error);
      process.exit(1);
    });
}

module.exports = main;