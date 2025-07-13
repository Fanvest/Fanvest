const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function createDemoClub() {
  try {
    // Créer un utilisateur de démo s'il n'existe pas
    let demoUser = await prisma.user.findUnique({
      where: { privyId: 'demo-user' }
    });

    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          privyId: 'demo-user',
          email: 'demo@fanstock.com',
          walletAddress: '0x1234567890123456789012345678901234567890'
        }
      });
      console.log('✅ Utilisateur de démo créé:', demoUser.privyId);
    }

    // Créer un club de démo avec l'ID "demo"
    let demoClub = await prisma.club.findUnique({
      where: { id: 'demo' }
    });

    if (!demoClub) {
      demoClub = await prisma.club.create({
        data: {
          id: 'demo',
          name: 'FC Demo',
          location: 'Paris, France',
          description: 'Club de démonstration pour FanStock',
          founded: 2020,
          ownerId: demoUser.privyId
        }
      });
      console.log('✅ Club de démo créé:', demoClub.id);
    } else {
      console.log('✅ Club de démo existe déjà:', demoClub.id);
    }

    console.log('🎉 Configuration de démo terminée!');
  } catch (error) {
    console.error('❌ Erreur lors de la création du club de démo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoClub();