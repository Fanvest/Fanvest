# 🏆 FanVest - Template Smart Contract

Template simple pour créer des tokens fan pour les clubs de sport sur la blockchain Chiliz.

## 📁 Structure du projet

```
smart-contracts/
├── contracts/
│   └── FanToken.sol      # Template du smart contract
├── scripts/
│   └── deploy.js         # Script de déploiement
├── hardhat.config.js     # Configuration Hardhat
├── .env.example          # Variables d'environnement
└── package.json          # Dépendances
```

## 🚀 Installation rapide

1. **Installer les dépendances:**
   ```bash
   cd smart-contracts
   npm install
   ```

2. **Configurer l'environnement:**
   ```bash
   cp .env.example .env
   # Éditer .env avec votre clé privée
   ```

3. **Compiler le contrat:**
   ```bash
   npm run compile
   ```

## 🎯 Déployer un token pour un club

1. **Modifier les paramètres dans `scripts/deploy.js`:**
   ```javascript
   const tokenParams = {
     name: "Paris FC Fan Token",           // Nom du token
     symbol: "PFC",                        // Symbole (3-5 lettres)
     initialSupply: 500000,                // Nombre de tokens
     clubName: "Paris Football Club",      // Nom du club
     clubDescription: "Club de Ligue 2 parisien",
     owner: "0x1234..."                    // Adresse wallet du club
   };
   ```

2. **Déployer sur Spicy (testnet):**
   ```bash
   npm run deploy:spicy
   ```

## 🔧 Ce que fait le smart contract

- **Token ERC-20 standard** compatible avec tous les wallets
- **Supply fixe** défini au déploiement (pas de mint supplémentaire)
- **Propriété transférée au club** automatiquement
- **Informations du club** stockées dans le contrat
- **Fonction pour mettre à jour** la description du club

## 🌐 Réseaux supportés

- **Spicy Testnet** (pour les tests) - ChainID: 88882
- **Chiliz Mainnet** (pour la production) - ChainID: 88888

## 💡 Utilisation

Chaque club peut avoir son propre token en dupliquant simplement le déploiement avec ses paramètres.

**Exemple pour 3 clubs différents:**
- Club A: "Marseille FC Token" (MFC) - 1M tokens
- Club B: "Lyon United Token" (LYU) - 500K tokens  
- Club C: "Toulouse Sport Token" (TST) - 2M tokens

## 🔒 Sécurité

- Utilisez toujours un wallet de test sur Spicy
- Ne partagez jamais votre clé privée
- Vérifiez les paramètres avant déploiement
