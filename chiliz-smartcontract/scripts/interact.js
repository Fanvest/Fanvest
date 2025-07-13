const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.log("❌ Veuillez définir CONTRACT_ADDRESS dans les variables d'environnement");
    return;
  }

  console.log("🔧 Interaction avec le contrat FanToken...");
  console.log("📍 Adresse du contrat:", contractAddress, "\n");

  const [owner, fan1, fan2] = await ethers.getSigners();
  const FanToken = await ethers.getContractFactory("FanToken");
  const fanToken = FanToken.attach(contractAddress);

  try {
    console.log("📊 Informations du contrat:");
    console.log("- Nom:", await fanToken.name());
    console.log("- Symbole:", await fanToken.symbol());
    console.log("- Club:", await fanToken.clubName());
    console.log("- Propriétaire:", await fanToken.owner());
    console.log("- Supply totale:", ethers.formatEther(await fanToken.totalSupply()), "tokens\n");

    console.log("🎯 Test 1: Création d'un sondage");
    const question = "Quel maillot préférez-vous pour la prochaine saison ?";
    const options = ["Maillot rouge classique", "Maillot bleu moderne", "Maillot blanc spécial"];
    const duration = 24; // 24 heures

    const createPollTx = await fanToken.createPoll(question, options, duration);
    await createPollTx.wait();
    console.log("✅ Sondage créé avec succès!");

    const pollId = await fanToken.pollCounter();
    console.log("📊 ID du sondage:", pollId.toString(), "\n");

    console.log("🎯 Test 2: Distribution de tokens aux fans");
    const transferAmount = ethers.parseEther("1000"); // 1000 tokens
    
    const transferTx1 = await fanToken.transfer(fan1.address, transferAmount);
    await transferTx1.wait();
    
    const transferTx2 = await fanToken.transfer(fan2.address, transferAmount);
    await transferTx2.wait();
    
    console.log("✅ Tokens distribués aux fans!");
    console.log("- Fan 1 balance:", ethers.formatEther(await fanToken.balanceOf(fan1.address)), "tokens");
    console.log("- Fan 2 balance:", ethers.formatEther(await fanToken.balanceOf(fan2.address)), "tokens\n");

    console.log("🎯 Test 3: Vote des fans");
    const voteTx1 = await fanToken.connect(fan1).vote(pollId, 0); // Vote pour l'option 0
    await voteTx1.wait();
    
    const voteTx2 = await fanToken.connect(fan2).vote(pollId, 1); // Vote pour l'option 1
    await voteTx2.wait();
    
    console.log("✅ Votes enregistrés!");

    const results = await fanToken.getPollResults(pollId);
    console.log("📊 Résultats du sondage:");
    console.log("- Question:", results.question);
    for (let i = 0; i < results.options.length; i++) {
      console.log(`- ${results.options[i]}: ${ethers.formatEther(results.votes[i])} votes`);
    }
    console.log("- Total votes:", ethers.formatEther(results.totalVotes), "\n");

    console.log("🎯 Test 4: Distribution de récompenses");
    const rewardAmount = ethers.parseEther("50");
    const reason = "Participation au sondage";
    
    const rewardTx = await fanToken.distributeReward(fan1.address, rewardAmount, reason);
    await rewardTx.wait();
    
    console.log("✅ Récompense distribuée!");
    console.log("- Points de fidélité Fan 1:", (await fanToken.fanLoyaltyPoints(fan1.address)).toString());
    console.log("- Points de fidélité Fan 2:", (await fanToken.fanLoyaltyPoints(fan2.address)).toString(), "\n");

    console.log("🎉 Tests terminés avec succès!");

  } catch (error) {
    console.error("❌ Erreur lors de l'interaction:", error.message);
  }
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