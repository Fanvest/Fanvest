# 🚀 Guide Production - Mode Sans Démo

## ✅ Bugs Corrigés

1. **DEPLOYING_ addresses** - Supprimé le système d'adresses temporaires
2. **API route** - Échec propre si déploiement échoue 
3. **Token purchase** - Plus d'erreurs avec fausses adresses
4. **Validation** - Vérification des adresses avant sauvegarde

## 🔧 Pour Passer en Mode Production

### 1. Déployer les Smart Contracts

```bash
# Obtenir du CHZ testnet
# https://spicy-faucet.chiliz.com/
# Adresse: 0x5bA670cbf9ae016121A09652F20b180765649314

# Déployer la factory
cd contracts
npx hardhat run scripts/deploy-simple-final.js --network chilizSpicy
```

### 2. Mettre à Jour l'Adresse Factory

```typescript
// Dans lib/smart-contracts/token-factory.ts
const FACTORY_ADDRESSES = {
  [chilizSpicy.id]: 'NOUVELLE_ADRESSE_ICI', // Remplacer
  [chilizMainnet.id]: '', 
} as const;
```

### 3. Désactiver le Mode Démo

```bash
# Dans .env
NEXT_PUBLIC_DEMO_MODE=false
```

### 4. Redémarrer l'Application

```bash
npm run dev
```

## 🎯 Flow Production vs Démo

### Mode Démo (`NEXT_PUBLIC_DEMO_MODE=true`)
- ✅ **Création token** : Simulée (2s)
- ✅ **Achat token** : Simulé (2s) 
- ✅ **Solde** : Simulé
- ✅ **Transactions** : Hash fake
- ✅ **Interface** : Identique à production

### Mode Production (`NEXT_PUBLIC_DEMO_MODE=false`)
- ⚡ **Création token** : Smart contract factory déployé
- ⚡ **Achat token** : Transaction CHZ réelle
- ⚡ **Solde** : Lecture blockchain
- ⚡ **Transactions** : Hash réel + lien ChiliScan
- ⚡ **Interface** : Identique au démo

## 🛡 Sécurité Renforcée

Maintenant l'API **refuse** de sauvegarder si :
- Le déploiement smart contract échoue
- L'adresse retournée est invalide
- La transaction ne peut pas être confirmée

## 🧪 Test Recommandé

1. **Mode démo d'abord** : Tester toute l'interface
2. **Déployer contracts** : Une fois sûr du fonctionnement
3. **Mode production** : Basculer seulement après déploiement réussi

## ⚡ Commandes Rapides

```bash
# Activer démo
echo "NEXT_PUBLIC_DEMO_MODE=true" >> .env

# Désactiver démo  
echo "NEXT_PUBLIC_DEMO_MODE=false" >> .env

# Vérifier contract existe
node scripts/check-contract.js 0x...

# Nettoyer base (si besoin)
node scripts/cleanup-fake-addresses.js
```

## 🎭 État Actuel

- ✅ Mode démo activé (`NEXT_PUBLIC_DEMO_MODE=true`)
- ✅ Bugs corrigés
- ✅ Prêt pour hackathon
- 🔄 Smart contracts en attente de déploiement

**Pour le hackathon : Gardez le mode démo activé!**
**Pour production : Suivez ce guide pour déployer.**

---

*Guide mis à jour après correction des bugs* 🐛→✅