import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Récupérer les résultats détaillés d'un sondage avec pondération par tokens
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;

    // Récupérer le sondage avec ses options
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            totalSupply: true
          }
        },
        options: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Récupérer toutes les réponses pour ce sondage
    const responses = await prisma.pollResponse.findMany({
      where: { pollId },
      select: {
        optionId: true,
        tokenPower: true,
        user: {
          select: {
            privyId: true
          }
        }
      }
    });

    // Calculer les résultats pondérés
    const totalSupply = parseInt(poll.club.totalSupply || '1000000');
    let totalTokensVoted = 0;
    
    const results = poll.options.map(option => {
      // Filtrer les réponses qui correspondent à cette option spécifique
      const optionResponses = responses.filter(response => response.optionId === option.id);
      
      // Sommer les tokens pour cette option
      const tokenVotes = optionResponses.reduce((sum, response) => {
        return sum + parseInt(response.tokenPower || '0');
      }, 0);
      
      return {
        id: option.id,
        text: option.text,
        order: option.order,
        tokenVotes, // Nombre total de tokens pour cette option
        voterCount: optionResponses.length, // Nombre de votants (personnes)
        percentage: totalSupply > 0 ? (tokenVotes / totalSupply) * 100 : 0
      };
    });

    // Calculer le total des tokens votés
    totalTokensVoted = results.reduce((sum, result) => sum + result.tokenVotes, 0);

    // Calculer les pourcentages relatifs (par rapport aux votes exprimés)
    const resultsWithRelativePercentage = results.map(result => ({
      ...result,
      relativePercentage: totalTokensVoted > 0 ? (result.tokenVotes / totalTokensVoted) * 100 : 0
    }));

    // Calculer le nombre total de votants uniques
    const uniqueVoters = new Set(responses.map(response => response.user.privyId)).size;

    return NextResponse.json({
      pollId: poll.id,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      endDate: poll.endDate,
      totalSupply,
      totalTokensVoted,
      totalVoters: uniqueVoters,
      participationRate: totalSupply > 0 ? (totalTokensVoted / totalSupply) * 100 : 0,
      results: resultsWithRelativePercentage
    });

  } catch (error) {
    console.error('Erreur lors du calcul des résultats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}