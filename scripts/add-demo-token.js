const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function addDemoToken() {
  try {
    // Mettre à jour le club demo avec des données de token
    const updatedClub = await prisma.club.update({
      where: { id: 'demo' },
      data: {
        tokenAddress: '0x1234567890123456789012345678901234567890',
        tokenSymbol: 'FCDU',
        totalSupply: '1000000',
        pricePerToken: '2',
        tokenBandColor: '#FA0089',
        tokenAnimation: true,
        tokenTexture: null
      }
    });

    console.log('✅ Token ajouté au club demo:', {
      id: updatedClub.id,
      name: updatedClub.name,
      tokenSymbol: updatedClub.tokenSymbol,
      tokenAddress: updatedClub.tokenAddress,
      pricePerToken: updatedClub.pricePerToken + ' CHZ'
    });

    // Créer un enregistrement de revenus pour le token
    await prisma.revenue.create({
      data: {
        amount: '0',
        source: 'OTHER',
        description: `Token contract created: ${updatedClub.tokenSymbol}`,
        clubId: 'demo',
        distributed: false
      }
    });

    console.log('✅ Enregistrement de revenus créé');
    console.log('🎉 Club demo configuré avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDemoToken();