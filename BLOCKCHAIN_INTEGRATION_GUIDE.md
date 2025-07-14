# 🔗 Guide d'Intégration Blockchain - Fanvest

## 🎯 Vue d'ensemble

Fanvest intègre complètement les smart contracts Chiliz pour permettre aux clubs de créer leurs tokens et aux fans d'investir directement via la blockchain.

## 🔄 Modes de Fonctionnement

### Mode Démo (`NEXT_PUBLIC_DEMO_MODE=true`)
- ✅ **Parfait pour hackathons et démonstrations**
- ✅ Simule toutes les transactions blockchain
- ✅ Pas de CHZ réel nécessaire
- ✅ Interface utilisateur identique au mode production
- ✅ Délais réalistes (2s) pour simuler les transactions

### Mode Production (`NEXT_PUBLIC_DEMO_MODE=false`)
- ⚡ **Utilise de vrais smart contracts**
- ⚡ Transactions réelles sur Chiliz
- ⚡ Nécessite du CHZ dans le wallet
- ⚡ Frais de transaction réels
- ⚡ Contrats doivent être déployés

## 🛠 Commandes de Gestion

```bash
# Activer le mode démo
npm run demo:on

# Désactiver le mode démo (production)
npm run demo:off

# Basculer entre les modes
npm run demo:toggle

# Compiler les smart contracts
npm run hardhat:compile

# Déployer sur Chiliz testnet
npm run hardhat:deploy:chiliz
```

## 🏗 Architecture Smart Contract

### ClubToken.sol
- **Standard**: ERC20 avec gouvernance
- **Fonctionnalités**:
  - `buyTokens(amount)` - Achat de tokens avec CHZ
  - `vote(proposalId, support)` - Vote pondéré par tokens
  - `createProposal(description)` - Création de propositions
  - `addRevenue()` - Ajout de revenus
  - `distributeRevenue()` - Distribution aux détenteurs

### FanStockFactory.sol
- **Pattern**: Factory pour déploiement automatisé
- **Fonctionnalités**:
  - `createClubToken(...)` - Déploie un nouveau token
  - `getClubInfo(address)` - Infos sur un token
  - `factoryFee` - Frais de création (0.001 CHZ)

## 🔗 Intégration Frontend

### Hooks Personnalisés

#### `useBuyTokens()`
```typescript
const { buyTokens, isBuying } = useBuyTokens();

const result = await buyTokens({
  clubId: 'club-123',
  tokenAddress: '0x...',
  tokenSymbol: 'FCMT',
  amount: 10,
  pricePerToken: 2,
  testnet: true
});
```

#### `useTokenBalance()`
```typescript
const { balance, isLoading, refetch } = useTokenBalance(tokenAddress);
// balance = nombre de tokens détenus par l'utilisateur
```

#### `useCreateClubToken()`
```typescript
const { createToken, isCreating } = useCreateClubToken();

const result = await createToken({
  clubId: 'club-123',
  tokenName: 'FC Montreuil Fan Token',
  tokenSymbol: 'FCMT',
  totalSupply: '10000',
  pricePerToken: '2'
});
```

### Composants UI

#### `<BuyTokensModal />`
- Modal complet d'achat de tokens
- Gestion d'erreurs intégrée
- Liens vers l'explorateur blockchain
- Support mode démo/production

#### `<CreateTokenForm />`
- Formulaire de création de tokens
- Intégration smart contract factory
- Validation en temps réel

## 🌐 Configuration Réseau

### Chiliz Spicy Testnet
```typescript
export const chilizSpicy = {
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  rpcUrls: {
    default: { http: ['https://spicy-rpc.chiliz.com'] }
  },
  blockExplorers: {
    default: { name: 'ChiliScan', url: 'https://testnet.chiliscan.com' }
  }
}
```

### Chiliz Mainnet
```typescript
export const chilizMainnet = {
  id: 88888,
  name: 'Chiliz Chain',
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/chiliz'] }
  },
  blockExplorers: {
    default: { name: 'ChiliScan', url: 'https://chiliscan.com' }
  }
}
```

## 📊 Flow d'Achat de Tokens (Mode Production)

1. **Connexion Wallet**: Privy gère l'auth et les wallets embarqués
2. **Sélection Montant**: Interface utilisateur pour choisir le nombre de tokens
3. **Validation**: Vérification du solde CHZ suffisant
4. **Transaction**: Appel à `ClubToken.buyTokens(amount)` avec `value: totalCost`
5. **Confirmation**: Attente de 2 confirmations blockchain
6. **Mise à jour**: Refresh du solde utilisateur et interface

## 🔧 Intégration API

### Route: `/api/clubs/[id]/token`

#### POST - Création de token
```typescript
const response = await fetch(`/api/clubs/${clubId}/token`, {
  method: 'POST',
  body: JSON.stringify({
    tokenName: 'FC Montreuil Fan Token',
    tokenSymbol: 'FCMT',
    totalSupply: 10000,
    pricePerToken: 2,
    ownerId: user.id
  })
});
```

#### GET - Infos du token
```typescript
const response = await fetch(`/api/clubs/${clubId}/token`);
const { hasToken, club } = await response.json();
```

## 🛡 Gestion d'Erreurs

### Erreurs Courantes
```typescript
// Solde insuffisant
if (error.message?.includes('insufficient funds')) {
  return 'Solde CHZ insuffisant pour cette transaction';
}

// Transaction rejetée
if (error.message?.includes('user rejected')) {
  return 'Transaction annulée par l\'utilisateur';
}

// Contrat non déployé
if (error.message?.includes('execution reverted')) {
  return 'Smart contract non accessible';
}
```

## 🚀 Déploiement en Production

### 1. Désactiver le mode démo
```bash
npm run demo:off
```

### 2. Déployer les contrats
```bash
# S'assurer d'avoir du CHZ sur le testnet
# Faucet: https://spicy-faucet.chiliz.com/

npm run hardhat:deploy:chiliz
```

### 3. Mettre à jour les adresses
```typescript
// Dans lib/smart-contracts/token-factory.ts
const FACTORY_ADDRESSES = {
  [chilizSpicy.id]: 'NOUVELLE_ADRESSE_FACTORY',
  [chilizMainnet.id]: '', 
} as const;
```

### 4. Tester l'intégration
- Créer un club de test
- Déployer un token
- Effectuer un achat de test
- Vérifier sur ChiliScan

## 🎭 Démonstration Hackathon

Pour les hackathons, utilisez le mode démo:

```bash
npm run demo:on
npm run dev
```

**Avantages**:
- ✅ Expérience utilisateur identique
- ✅ Pas de dépendance réseau
- ✅ Démonstration fluide
- ✅ Aucun CHZ nécessaire
- ✅ Transactions instantanées

## 📝 Variables d'Environnement

```bash
# .env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVATE_KEY="your_private_key_for_deployment"
NEXT_PUBLIC_DEMO_MODE=true  # ou false pour production
```

## 🔍 Debugging

### Logs en mode développement
```bash
# Console navigateur affiche:
🎭 DEMO MODE: Simulating token purchase...
✅ Demo purchase successful: { tokenSymbol, amount, totalCost, transactionHash }

# Ou en production:
Buying tokens: { tokenAddress, amount, totalCostCHZ, totalCostWei, chain }
Transaction sent: 0x...
Transaction confirmed: { status, blockNumber, gasUsed }
```

### Outils de debug
- **ChiliScan**: Vérifier les transactions
- **Console navigateur**: Logs détaillés
- **Network tab**: Appels API
- **Privy dashboard**: Gestion des wallets

## 🎯 Points Clés

1. **Mode démo parfait pour démos** - Identique à la production sans blockchain
2. **Smart contracts prêts** - ClubToken + Factory déployables
3. **Interface complète** - Achat, création, gouvernance
4. **Gestion d'erreurs robuste** - Messages utilisateur clairs
5. **Extensible facilement** - Architecture modulaire

---

*Guide maintenu pour Hacking Paris 2025* 🚀