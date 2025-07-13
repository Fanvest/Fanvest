# Guide d'Intégration Smart Contract

## Aperçu
Le système est maintenant configuré pour utiliser de vrais IDs de clubs dynamiques au lieu du système "demo" figé. Voici comment intégrer vos smart contracts.

## État Actuel

### ✅ Réalisé
1. **Dashboard dynamique** - Utilise maintenant les vrais clubs de l'utilisateur
2. **API Token complète** - Routes POST et PATCH pour gérer le cycle de vie des tokens
3. **Navigation dynamique** - Tous les liens utilisent les vrais IDs de clubs
4. **Gestion des erreurs** - Cas où l'utilisateur n'a pas de club
5. **Placeholder smart contract** - Système prêt pour l'intégration

### 🔄 En attente de votre Smart Contract

## Structure de l'Intégration

### 1. Points d'Intégration API

**Création de Token** - `POST /api/clubs/[id]/token`
```typescript
// Fichier: app/api/clubs/[id]/token/route.ts
// Lignes 63-81

// TODO: SMART CONTRACT DEPLOYMENT
// Remplacer cette section :
const deploymentResult = await deployTokenContract({
  name: tokenName,
  symbol: tokenSymbol,
  totalSupply: parseInt(totalSupply),
  pricePerToken: parseInt(pricePerToken),
  owner: ownerId,
  clubId: clubId
});

const tokenAddress = deploymentResult.contractAddress;
const transactionHash = deploymentResult.transactionHash;
```

**Finalisation de Déploiement** - `PATCH /api/clubs/[id]/token`
- Utilisé pour mettre à jour l'adresse du contrat une fois déployé
- Le système stocke d'abord `DEPLOYING_XXX` puis met à jour avec l'adresse réelle

### 2. Dashboard Integration

**Fichier**: `app/dashboard/club/page.tsx`
```typescript
// Lignes 154-157
// TODO: Smart Contract Integration
// Une fois que vous fournissez le smart contract, remplacez cette section par :
// const deploymentResult = await deployTokenContract({...});
// puis appellez PATCH /api/clubs/${userClub.id}/token avec la vraie adresse
```

### 3. Structure Requise pour Votre Smart Contract

```typescript
// Interface attendue pour votre fonction de déploiement
interface TokenDeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed?: number;
  deploymentCost?: string;
}

interface TokenContractParams {
  name: string;
  symbol: string;
  totalSupply: number;
  pricePerToken: number;
  owner: string;
  clubId: string;
}

declare function deployTokenContract(params: TokenContractParams): Promise<TokenDeploymentResult>;
```

## Flux d'Intégration

### Phase 1: Fourniture du Smart Contract
1. **Créez le fichier** : `lib/smart-contracts/token-factory.ts`
2. **Implémentez la fonction** : `deployTokenContract`
3. **Configurez le provider** : `lib/web3/provider.ts` pour Chiliz Chain

### Phase 2: Mise à Jour des APIs
1. **Décommentez les imports** dans `app/api/clubs/[id]/token/route.ts`
2. **Remplacez le placeholder** par l'appel réel au smart contract
3. **Testez le déploiement**

### Phase 3: Intégration Dashboard
1. **Testez la création de tokens** depuis le dashboard
2. **Vérifiez la mise à jour** de l'adresse du contrat
3. **Validez l'affichage** des informations token

## Configuration Chiliz Chain

### Paramètres Réseau
```typescript
// Configuration pour Chiliz Chain
const CHILIZ_CONFIG = {
  chainId: 88888, // Mainnet
  chainIdTestnet: 88882, // Testnet  
  rpcUrl: 'https://rpc.ankr.com/chiliz',
  rpcUrlTestnet: 'https://spicy-rpc.chiliz.com',
  nativeCurrency: {
    name: 'CHZ',
    symbol: 'CHZ',
    decimals: 18
  }
};
```

## États du Token

Le système gère 3 états pour les tokens :

1. **Non créé** : `tokenAddress = null`
2. **En cours de déploiement** : `tokenAddress = "DEPLOYING_XXXX"`
3. **Déployé** : `tokenAddress = "0x1234...abcd"`

## Fichiers Modifiés

### APIs
- `app/api/clubs/[id]/token/route.ts` - ✅ Prêt pour intégration
- `app/api/clubs/route.ts` - ✅ Support filtrage par propriétaire

### Dashboard
- `app/dashboard/club/page.tsx` - ✅ Navigation dynamique complète

### Navigation
- Tous les liens "demo" remplacés par des IDs dynamiques
- Gestion des cas où l'utilisateur n'a pas de club

## Prochaines Étapes

1. **Fournir le smart contract** avec l'interface spécifiée
2. **Créer les fichiers de configuration** Web3/Chiliz
3. **Tester le déploiement** sur testnet d'abord
4. **Valider le flux complet** de création à utilisation

## Points d'Attention

- **Sécurité** : Vérification de propriété avant toute opération
- **Gestion d'erreurs** : Smart contracts peuvent échouer
- **Gas fees** : Prévoir la gestion des coûts
- **Timeouts** : Le déploiement peut prendre du temps

Le système est maintenant complètement préparé pour votre intégration smart contract !