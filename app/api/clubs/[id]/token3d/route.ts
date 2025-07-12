import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Récupérer les données 3D du token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        tokenTexture: true,
        tokenBandColor: true,
        tokenAnimation: true,
        tokenAddress: true,
        tokenSymbol: true
      }
    });

    if (!club) {
      return NextResponse.json({ error: 'Club introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      clubId: club.id,
      clubName: club.name,
      tokenData: {
        texture: club.tokenTexture,
        bandColor: club.tokenBandColor || '#8B4513',
        animationEnabled: club.tokenAnimation ?? true
      },
      hasToken: !!club.tokenAddress
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données 3D:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Sauvegarder les données 3D du token
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;
    const body = await request.json();

    const { texture, bandColor, animationEnabled } = body;

    // Validation des données
    if (typeof animationEnabled !== 'boolean') {
      return NextResponse.json({ error: 'animationEnabled doit être un booléen' }, { status: 400 });
    }

    if (bandColor && !/^#[0-9A-F]{6}$/i.test(bandColor)) {
      return NextResponse.json({ error: 'bandColor doit être un code couleur hexadécimal valide' }, { status: 400 });
    }

    // Vérifier que le club existe
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId }
    });

    if (!existingClub) {
      return NextResponse.json({ error: 'Club introuvable' }, { status: 404 });
    }

    // Sauvegarder les données 3D
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        tokenTexture: texture,
        tokenBandColor: bandColor,
        tokenAnimation: animationEnabled,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        tokenTexture: true,
        tokenBandColor: true,
        tokenAnimation: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'Données 3D sauvegardées avec succès',
      club: updatedClub
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données 3D:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}