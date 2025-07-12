const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function checkDemoClub() {
  try {
    const club = await prisma.club.findUnique({
      where: { id: 'demo' },
      include: {
        owner: {
          select: { privyId: true, email: true }
        }
      }
    });

    if (club) {
      console.log('🔍 Club "demo" trouvé dans la DB:');
      console.log('-----------------------------------');
      console.log('ID:', club.id);
      console.log('Nom:', club.name);
      console.log('Description:', club.description);
      console.log('Lieu:', club.location);
      console.log('Fondé en:', club.founded);
      console.log('Logo:', club.logo ? 'OUI' : 'NON');
      console.log('Liens sociaux:', club.socialLinks);
      console.log('Propriétaire:', club.owner.email);
      console.log('Dernière mise à jour:', club.updatedAt);
      console.log('Token 3D:');
      console.log('  - Texture:', club.tokenTexture ? 'OUI' : 'NON');
      console.log('  - Couleur:', club.tokenBandColor);
      console.log('  - Animation:', club.tokenAnimation);
      console.log('-----------------------------------');
    } else {
      console.log('❌ Club "demo" non trouvé dans la DB');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDemoClub();