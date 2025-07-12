import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
import sharp from 'sharp';

// POST /api/upload/club-logo - Upload club logo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clubId = formData.get('clubId') as string;

    if (!file || !clubId) {
      return NextResponse.json(
        { error: 'Missing file or clubId' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with Sharp (resize and optimize for logos)
    const processedImage = await sharp(buffer)
      .resize(150, 150, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: 90 })
      .toBuffer();

    // For now, we'll store as base64 data URL
    // In production, you'd upload to cloud storage
    const base64Image = `data:image/png;base64,${processedImage.toString('base64')}`;

    // Update club logo
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: { logo: base64Image },
      select: {
        id: true,
        name: true,
        logo: true,
        location: true
      }
    });

    return NextResponse.json({
      success: true,
      club: updatedClub,
      logoUrl: base64Image
    });

  } catch (error) {
    console.error('Error uploading club logo:', error);
    return NextResponse.json(
      { error: 'Failed to upload club logo' },
      { status: 500 }
    );
  }
}