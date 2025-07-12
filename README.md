# 🪙 Template Pièce de Monnaie 3D

Un template React interactif pour créer et personnaliser une pièce de monnaie 3D avec des effets métalliques et des animations de rotation.

## ✨ Fonctionnalités

- **Rendu 3D** : Pièce de monnaie réaliste avec Three.js et React Three Fiber
- **Textures personnalisées** : Uploadez vos propres images pour les faces pile et face
- **Effets métalliques** : Contrôles pour ajuster l'aspect métallique et la rugosité
- **Animation de rotation** : La pièce tourne comme une toupie avec vitesse ajustable
- **Contrôles interactifs** : Interface utilisateur pour personnaliser tous les paramètres
- **Éclairage réaliste** : Environnement HDR et éclairage directionnel pour des reflets authentiques

## 🚀 Installation et Démarrage

1. Installez les dépendances :
```bash
npm install
```

2. Lancez l'application :
```bash
npm start
```

3. Ouvrez votre navigateur à l'adresse `http://localhost:3000`

## 🎮 Utilisation

### Contrôles disponibles :
- **Images** : Uploadez des images pour personnaliser les faces de la pièce
- **Vitesse de rotation** : Ajustez la vitesse de rotation (0-3)
- **Effet métallique** : Contrôlez l'intensité de l'effet métallique (0-1)
- **Rugosité** : Ajustez la rugosité de la surface (0-1)
- **Taille** : Modifiez la taille de la pièce (1-4)

### Navigation 3D :
- **Rotation** : Clic gauche + glisser
- **Zoom** : Molette de la souris
- **Panoramique** : Clic droit + glisser

## 🛠️ Technologies Utilisées

- **React** : Framework JavaScript
- **Three.js** : Bibliothèque 3D
- **React Three Fiber** : Intégration React pour Three.js
- **React Three Drei** : Utilitaires pour React Three Fiber

## 📁 Structure du Projet

```
src/
├── App.js          # Composant principal avec l'interface
├── Coin3D.js       # Composant de la pièce 3D
├── index.js        # Point d'entrée
└── index.css       # Styles CSS
```

## 🎨 Personnalisation

Le composant `Coin3D` peut être facilement personnalisé :

```javascript
<Coin3D 
  frontTexture={frontTexture}
  backTexture={backTexture}
  rotationSpeed={1}
  metallic={0.8}
  roughness={0.2}
  radius={2}
  thickness={0.2}
/>
```

## 📝 Notes Techniques

- Les textures par défaut sont générées dynamiquement avec Canvas 2D
- L'effet métallique utilise des normal maps et un environnement HDR
- L'animation utilise `useFrame` de React Three Fiber
- Les contrôles sont optimisés pour une expérience utilisateur fluide
