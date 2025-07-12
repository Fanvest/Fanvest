import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Récupérer les paramètres du club
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
        description: true,
        logo: true,
        location: true,
        founded: true,
        socialLinks: true
      }
    });

    if (!club) {
      return NextResponse.json({ error: 'Club introuvable' }, { status: 404 });
    }

    // Parser les liens sociaux s'ils existent
    let socialLinks = { facebook: '', instagram: '', website: '' };
    if (club.socialLinks) {
      try {
        socialLinks = JSON.parse(club.socialLinks);
      } catch (e) {
        // Garder les valeurs par défaut si parsing échoue
      }
    }

    return NextResponse.json({
      clubId: club.id,
      clubName: club.name,
      description: club.description || '',
      logo: club.logo,
      location: club.location,
      founded: club.founded,
      socialLinks
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Sauvegarder les paramètres du club
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;
    const body = await request.json();

    console.log('🔍 PUT /api/clubs/[id]/settings - Data received:', {
      clubId,
      body
    });

    const { clubName, description, socialLinks, logo } = body;

    // Validation des données
    if (!clubName || clubName.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom du club est requis' }, { status: 400 });
    }

    // Vérifier que le club existe
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId }
    });

    if (!existingClub) {
      return NextResponse.json({ error: 'Club introuvable' }, { status: 404 });
    }

    // Préparer les données à mettre à jour
    const updateData: any = {
      name: clubName.trim(),
      description: description?.trim() || null,
      updatedAt: new Date()
    };

    // Sauvegarder les liens sociaux en JSON
    if (socialLinks) {
      updateData.socialLinks = JSON.stringify(socialLinks);
    }

    // Ajouter le logo si fourni
    if (logo) {
      updateData.logo = logo;
    }

    console.log('💾 Updating club with data:', updateData);

    // Sauvegarder les modifications
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        location: true,
        founded: true,
        socialLinks: true,
        updatedAt: true
      }
    });

    console.log('✅ Club updated successfully:', updatedClub);

    return NextResponse.json({
      message: 'Paramètres sauvegardés avec succès',
      club: updatedClub
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}