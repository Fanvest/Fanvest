const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Déploiement du contrat FanToken sur Chiliz...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Adresse du déployeur:", deployer.address);
  console.log("Balance du déployeur:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "CHZ\n");

  const tokenName = "Angouleme";
  const tokenSymbol = "ANG";
  const clubName = "Angoulem Saint-Germain";

  console.log("📝 Paramètres du token:");
  console.log("- Nom:", tokenName);
  console.log("- Symbole:", tokenSymbol);
  console.log("- Club:", clubName);
  console.log("- Supply initial: 1,000,000 tokens\n");

  const FanToken = await ethers.getContractFactory("FanToken");
  console.log("⏳ Déploiement en cours...");
  
  const fanToken = await FanToken.deploy(tokenName, tokenSymbol, clubName);
  await fanToken.waitForDeployment();

  const contractAddress = await fanToken.getAddress();
  console.log("✅ Contrat déployé à l'adresse:", contractAddress);
  console.log("🔗 Lien Chiliz Explorer:", `https://chiliscan.com/address/${contractAddress}\n`);

  console.log("📊 Vérification du déploiement:");
  console.log("- Nom du token:", await fanToken.name());
  console.log("- Symbole:", await fanToken.symbol());
  console.log("- Club:", await fanToken.clubName());
  console.log("- Propriétaire:", await fanToken.owner());
  console.log("- Supply totale:", ethers.formatEther(await fanToken.totalSupply()), "tokens");
  console.log("- Balance du propriétaire:", ethers.formatEther(await fanToken.balanceOf(deployer.address)), "tokens\n");

  console.log("🎯 Exemple d'utilisation:");
  console.log("1. Créer un sondage: fanToken.createPoll(...)");
  console.log("2. Voter: fanToken.vote(pollId, option)");
  console.log("3. Distribuer des récompenses: fanToken.distributeReward(...)");
  console.log("4. Voir les points de fidélité: fanToken.fanLoyaltyPoints(address)\n");

  return {
    contractAddress,
    deployer: deployer.address
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Erreur lors du déploiement:", error);
      process.exit(1);
    });
}

module.exports = main;