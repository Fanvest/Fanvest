# 🚀 Fanvest - Guide de Déploiement

## Vue d'ensemble
Ce guide explique comment déployer et utiliser les smart contracts Fanvest sur le testnet Chiliz.

## ✅ Structure Implémentée

### Smart Contracts
```
contracts/
├── contracts/
│   ├── ClubToken.sol         # Token ERC20 pour chaque club
│   └── FanStockFactory.sol   # Factory pour créer les tokens
├── scripts/
│   └── deploy.js            # Script de déploiement
└── hardhat.config.js        # Configuration Hardhat
```

### Frontend Integration
```
lib/
├── smart-contracts/
│   └── token-factory.ts     # Interface de déploiement
├── contracts/
│   ├── ClubToken.json       # ABI du token
│   └── FanStockFactory.json # ABI de la factory
└── web3/
    └── config.ts           # Configuration Chiliz
```

## 📋 Fonctionnalités

### ClubToken.sol
- ✅ **ERC20 Token** avec fonctionnalités étendues
- ✅ **Achat de tokens** avec paiement en CHZ
- ✅ **Système de gouvernance** avec votes des fans
- ✅ **Distribution de revenus** configurable
- ✅ **Système de veto** par le club
- ✅ **Paramètres configurables** :
  - Pouvoir de vote des fans : 10-49%
  - Part des revenus des fans : 0-15%

### FanStockFactory.sol
- ✅ **Factory Pattern** pour déployer les tokens
- ✅ **Gestion des frais** de création (0.001 CHZ)
- ✅ **Registre de tous les clubs** créés
- ✅ **Administration** des statuts des clubs

## 🛠 Configuration du Déploiement

### 1. Variables d'Environnement
Créer un fichier `.env` :
```bash
# Smart Contract Deployment
PRIVATE_KEY=your_private_key_here

# Database
DATABASE_URL="file:./dev.db"

# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here
```

### 2. Obtenir du CHZ Testnet
1. Aller sur https://spicy-faucet.chiliz.com/
2. Connecter votre wallet
3. Obtenir des CHZ de test

### 3. Compiler les Contrats
```bash
cd contracts
npm install
npx hardhat compile
```

### 4. Déployer sur Chiliz Testnet
```bash
# Dans le dossier contracts/
npx hardhat run scripts/deploy.js --network chilizSpicy
```

## 📊 Résultats du Déploiement Existant

### Contrats Déployés sur Chiliz Spicy Testnet
```
Factory Address: 0x0CD0b824bC7c65388D802F99F5B47FF8DE33Cb12
Demo Token Address: 0x0E07b26D49eE1898a30BD3894D09F0446624042C
Network: Chiliz Spicy Testnet (88882)
```

### Paramètres du Token Demo
- **Nom** : FC Montreuil Fan Token
- **Symbole** : FCMNT
- **Prix** : 0.001 CHZ par token
- **Votes des fans** : 40%
- **Revenus des fans** : 10%

## 🔧 Intégration API

### Route de Création de Token
`POST /api/clubs/[id]/token`

Le système est configuré pour :
1. ✅ Recevoir les paramètres du token
2. ✅ Appeler `deployTokenContract()` 
3. ✅ Gérer les erreurs avec fallback
4. ✅ Mettre à jour la base de données

### Flux de Création
1. **Frontend** → Formulaire de création de token
2. **API** → Appel au smart contract
3. **Blockchain** → Déploiement via Factory
4. **Database** → Sauvegarde de l'adresse du contrat

## 🌐 Utilisation Frontend

### Installation des Dépendances
```bash
npm install
```

### Lancement du Dev Server
```bash
npm run dev
```

### Configuration Wagmi
Le projet utilise Wagmi v2 avec support pour Chiliz :
```typescript
// lib/web3/config.ts
export const chilizSpicy = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  rpcUrls: {
    default: { http: ['https://spicy-rpc.chiliz.com'] }
  }
})
```

## 🧪 Tests et Vérification

### Vérifier les Contrats
```bash
# Checker le statut de la factory
npx hardhat run scripts/check-factory.js --network chilizSpicy
```

### Interactions Test
1. **Créer un club** via l'interface
2. **Générer un token** depuis le dashboard
3. **Vérifier le déploiement** sur ChilizScan
4. **Tester l'achat de tokens**

## 📈 Monitoring

### ChilizScan Testnet
- **Factory** : https://testnet.chiliscan.com/address/0x0CD0b824bC7c65388D802F99F5B47FF8DE33Cb12
- **Demo Token** : https://testnet.chiliscan.com/address/0x0E07b26D49eE1898a30BD3894D09F0446624042C

### Logs de Déploiement
```bash
# Voir les logs du serveur Next.js
npm run dev

# Les déploiements sont loggés dans la console
```

## 🚨 Gestion d'Erreurs

### Cas d'Échec du Déploiement
- ✅ **Fallback** : `DEPLOYING_${timestamp}`
- ✅ **Retry Logic** : Via route PATCH
- ✅ **Error Logging** : Console + base de données

### Debugging
```typescript
// Vérifier le statut de la factory
import { checkFactoryStatus } from '@/lib/smart-contracts/token-factory'

const status = await checkFactoryStatus(true) // testnet
console.log(status)
```

## 🎯 Prochaines Étapes

### Production
1. **Déployer sur Chiliz Mainnet**
2. **Configurer les adresses de production**
3. **Tests de charge**

### Améliorations
1. **Interface de gouvernance** complète
2. **Système de staking** des tokens
3. **Analytics** des revenus

## 💡 Notes Importantes

- ⚠️ **Node.js v23** : Warning Hardhat (non critique)
- 🔐 **Private Key** : Nécessaire pour le déploiement
- 💰 **Gas Fees** : ~0.001 CHZ par déploiement
- 🔍 **Testnet First** : Toujours tester avant mainnet

Le système est maintenant **entièrement opérationnel** et prêt pour la création de fan tokens démocratisés ! 🎉