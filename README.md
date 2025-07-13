# 🚀 FanToken - Smart Contract pour Hackathon Chiliz

Un smart contract ERC20 avancé pour créer des tokens de fan avec fonctionnalités de vote, récompenses et fidélité sur la blockchain Chiliz.

## 🎯 Fonctionnalités

### 🏆 Token ERC20 Personnalisé
- Supply initial : 1,000,000 tokens
- Nom et symbole personnalisables par club
- Propriété du club gérant le token

### 🗳️ Système de Vote
- Création de sondages par le propriétaire
- Vote pondéré par le nombre de tokens possédés
- Durée configurable des sondages
- Résultats transparents et vérifiables

### 🎁 Système de Récompenses
- Distribution de tokens en récompense
- Historique des récompenses par fan
- Distribution en lot pour plusieurs fans

### ⭐ Points de Fidélité
- Points gagnés en votant (+10 points)
- Points gagnés en recevant des récompenses
- Points gagnés en brûlant des tokens (bonus x10)

### 🔒 Sécurité
- Protection contre la réentrance
- Validation des paramètres
- Contrôle d'accès propriétaire

## 🛠️ Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd chiliz-smartcontract

# Installer les dépendances
npm install

# Compiler les contrats
npm run compile
```

## 🚀 Déploiement

### Sur le testnet Chiliz (Spicy)
```bash
# Configurer votre clé privée dans hardhat.config.js
npm run deploy:testnet
```

### Sur le mainnet Chiliz
```bash
npm run deploy:mainnet
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests avec détails
npx hardhat test --verbose
```

## 🎮 Utilisation

### Créer un sondage
```javascript
await fanToken.createPoll(
  "Quel maillot préférez-vous ?",
  ["Rouge", "Bleu", "Blanc"],
  24 // durée en heures
);
```

### Voter
```javascript
// Il faut avoir au moins 100 tokens pour voter
await fanToken.vote(1, 0); // pollId = 1, option = 0
```

### Distribuer des récompenses
```javascript
await fanToken.distributeReward(
  "0x...", // adresse du fan
  ethers.parseEther("50"), // 50 tokens
  "Participation active"
);
```

### Voir les résultats d'un sondage
```javascript
const results = await fanToken.getPollResults(1);
console.log(results);
```

## 📊 Exemples d'interaction

Le script `scripts/interact.js` contient des exemples d'utilisation :

```bash
# Définir l'adresse du contrat déployé
export CONTRACT_ADDRESS=0x...

# Lancer les interactions de test
npm run interact
```

## 🌐 Configuration Chiliz

### Réseaux supportés

**Testnet Spicy :**
- RPC : https://spicy-rpc.chiliz.com
- Chain ID : 88882
- Explorer : https://spicy-explorer.chiliz.com

**Mainnet Chiliz :**
- RPC : https://rpc.ankr.com/chiliz
- Chain ID : 88888
- Explorer : https://chiliscan.com

## 💡 Cas d'usage pour le hackathon

1. **Engagement des fans** : Vote sur les décisions du club
2. **Programme de fidélité** : Récompenses basées sur l'engagement
3. **Accès exclusif** : Tokens requis pour certains contenus
4. **Gamification** : Points de fidélité et récompenses
5. **Gouvernance** : Participation aux décisions importantes

## 🏗️ Architecture du contrat

```
FanToken.sol
├── ERC20 (OpenZeppelin)
├── Ownable (OpenZeppelin)
├── ReentrancyGuard (OpenZeppelin)
├── Polls Management
├── Rewards System
└── Loyalty Points
```

## 📈 Métriques du contrat

- **Polls créés** : Compteur global des sondages
- **Votes totaux** : Somme pondérée des votes par sondage
- **Récompenses distribuées** : Historique par fan
- **Points de fidélité** : Score cumulé par fan

## 🔧 Développement

```bash
# Démarrer un nœud local
npm run node

# Déployer sur le réseau local
npx hardhat run scripts/deploy.js --network localhost

# Vérifier le contrat (après déploiement)
npx hardhat verify --network chilizTestnet <CONTRACT_ADDRESS> "Token Name" "SYMBOL" "Club Name"
```

## 🎨 Personnalisation

Pour adapter le contrat à votre club :

1. Modifier les paramètres dans `scripts/deploy.js`
2. Ajuster `minimumTokensToVote` selon vos besoins
3. Personnaliser les événements et métriques

## 📝 License

MIT - Parfait pour le hackathon !

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

---

**Bonne chance pour le hackathon Chiliz ! 🚀⚽**