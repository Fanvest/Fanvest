const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

function toggleDemoMode() {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const lines = envContent.split('\n');
    let demoModeLineIndex = -1;
    let currentValue = 'true'; // default
    
    // Trouver la ligne NEXT_PUBLIC_DEMO_MODE
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('NEXT_PUBLIC_DEMO_MODE=')) {
        demoModeLineIndex = i;
        currentValue = lines[i].split('=')[1];
        break;
      }
    }
    
    // Basculer la valeur
    const newValue = currentValue === 'true' ? 'false' : 'true';
    
    if (demoModeLineIndex !== -1) {
      lines[demoModeLineIndex] = `NEXT_PUBLIC_DEMO_MODE=${newValue}`;
    } else {
      lines.push(`NEXT_PUBLIC_DEMO_MODE=${newValue}`);
    }
    
    // Écrire le fichier
    fs.writeFileSync(envPath, lines.join('\n'));
    
    console.log(`🔄 Mode démo ${newValue === 'true' ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    console.log(`📝 Fichier .env mis à jour: NEXT_PUBLIC_DEMO_MODE=${newValue}`);
    
    if (newValue === 'false') {
      console.log('\n⚠️  Mode production activé:');
      console.log('   - Les transactions utiliseront de vrais smart contracts');
      console.log('   - Vous devez avoir des CHZ dans votre wallet');
      console.log('   - Les frais de transaction seront réels');
      console.log('   - Assurez-vous que les contrats sont déployés');
    } else {
      console.log('\n🎭 Mode démo activé:');
      console.log('   - Les transactions sont simulées');
      console.log('   - Aucun CHZ réel nécessaire');
      console.log('   - Parfait pour les démonstrations');
    }
    
    console.log('\n🔄 Redémarrez le serveur de développement pour appliquer les changements');
    
  } catch (error) {
    console.error('❌ Erreur lors de la modification du fichier .env:', error.message);
  }
}

// Permettre d'appeler avec un argument spécifique
const args = process.argv.slice(2);
if (args.length > 0) {
  const mode = args[0].toLowerCase();
  if (mode === 'on' || mode === 'true' || mode === 'demo') {
    fs.writeFileSync(envPath, fs.readFileSync(envPath, 'utf8').replace(/NEXT_PUBLIC_DEMO_MODE=.*/g, 'NEXT_PUBLIC_DEMO_MODE=true'));
    console.log('🎭 Mode démo ACTIVÉ');
  } else if (mode === 'off' || mode === 'false' || mode === 'production' || mode === 'prod') {
    fs.writeFileSync(envPath, fs.readFileSync(envPath, 'utf8').replace(/NEXT_PUBLIC_DEMO_MODE=.*/g, 'NEXT_PUBLIC_DEMO_MODE=false'));
    console.log('⚡ Mode production ACTIVÉ');
  } else {
    console.log('Usage: node scripts/toggle-demo-mode.js [on|off|demo|production]');
  }
} else {
  toggleDemoMode();
}