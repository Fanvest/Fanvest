# 🚀 Déploiement rapide avec Remix IDE

## Étapes simples (5 minutes) :

### 1. Ouvrir Remix
- Allez sur : https://remix.ethereum.org/

### 2. Créer le fichier
- Créez un nouveau fichier : `FanToken.sol`
- Copiez-collez le code ci-dessous

### 3. Code du contrat
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FanToken is ERC20, Ownable {
    
    string public clubName;
    string public clubDescription;
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        string memory _clubName,
        string memory _clubDescription,
        address _owner
    ) ERC20(_name, _symbol) Ownable(_owner) {
        clubName = _clubName;
        clubDescription = _clubDescription;
        _mint(_owner, _initialSupply * 10**decimals());
    }
    
    function updateClubDescription(string memory _newDescription) external onlyOwner {
        clubDescription = _newDescription;
    }
    
    function getClubInfo() external view returns (string memory, string memory) {
        return (clubName, clubDescription);
    }
}
```

### 4. Compiler
- Onglet "Solidity Compiler"
- Version : 0.8.20
- Cliquez "Compile FanToken.sol"

### 5. Déployer
- Onglet "Deploy & Run Transactions"
- Environment : "Injected Provider - MetaMask"
- Assurez-vous d'être sur Chiliz Spicy (ChainID: 88882)
- Remplissez les paramètres :
  - `_name`: "Exemple Club Fan Token"
  - `_symbol`: "EXEMPLE"
  - `_initialSupply`: 1000000
  - `_clubName`: "Exemple Football Club"
  - `_clubDescription`: "Club émergent"
  - `_owner`: 0xe1DD80637F288CAeC7482D11a2B04580bfc6855C
- Cliquez "Deploy"

### 6. Vérifier
- Copiez l'adresse du contrat déployé
- Allez sur : https://spicy-explorer.chiliz.com/
- Collez l'adresse pour voir votre token

## ✅ Avantages de Remix :
- Interface graphique simple
- Pas de problèmes de réseau
- Déploiement en 1 clic
- Parfait pour les hackathons

## 🔄 Pour dupliquer pour d'autres clubs :
Changez juste les paramètres et redéployez !
