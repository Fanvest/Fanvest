# ⚡ Guide Rapide - Production Sans Mode Démo

## 🎯 Option 1: Utiliser une Factory Déjà Déployée

Si le déploiement prend trop de temps, vous pouvez utiliser une factory existante sur Chiliz testnet:

### 1. Mettre à jour l'adresse factory

```typescript
// Dans lib/smart-contracts/token-factory.ts
const FACTORY_ADDRESSES = {
  [chilizSpicy.id]: '0x742d35Cc6634C0532925a3b8D4000c59Ab8fAE11', // Exemple d'adresse
  [chilizMainnet.id]: '', 
} as const;
```

### 2. Désactiver le mode démo

```bash
npm run demo:off
```

### 3. Tester immédiatement

```bash
npm run dev
```

## 🎯 Option 2: Déployer Votre Propre Factory

### 1. Obtenir plus de CHZ

Visitez: https://spicy-faucet.chiliz.com/
- Adresse: `0x4484eD93F9bD5Ab5c556E7d07813cfD75711a076`
- Demander au moins 10 CHZ

### 2. Relancer le déploiement

```bash
cd contracts
npx hardhat run scripts/deploy-simple-final.js --network chilizSpicy
```

### 3. Mettre à jour l'adresse

Une fois déployé, copier l'adresse dans le code.

## 🎯 Option 3: Mode Hybride

Gardez le mode démo pour la création de tokens, mais utilisez de vrais contrats pour l'achat:

```typescript
// Dans hooks/useBuyTokens.ts - ligne 52
if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
  // Changer en 'false' pour forcer l'utilisation de vrais contrats
```

## 🚀 Test Rapide

1. **Créer un club** (fonctionne toujours)
2. **Créer un token** (mode démo ou vrai)
3. **Acheter des tokens** (vrai contrat si configuré)

## 🔍 Vérification

### Vérifier qu'un contrat existe:
```bash
# Remplacer ADDRESS par l'adresse à tester
curl -X POST https://spicy-rpc.chiliz.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["ADDRESS","latest"],"id":1}'
```

Si le résultat n'est pas "0x", le contrat existe!

## 📋 Checklist Production

- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] Adresse factory valide
- [ ] Wallet connecté avec CHZ
- [ ] Tests d'achat fonctionnels

## 🎭 Retour en Mode Démo

Si problème:
```bash
npm run demo:on
npm run dev
```

---

*Guide de secours pour Hacking Paris 2025* 🚀