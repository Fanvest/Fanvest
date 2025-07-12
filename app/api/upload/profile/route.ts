import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import sharp from 'sharp';

// POST /api/upload/profile - Upload profile picture
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing file or userId' },
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

    // Process image with Sharp (resize and optimize)
    const processedImage = await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // For now, we'll store as base64 data URL
    // In production, you'd upload to cloud storage (Cloudinary, S3, etc.)
    const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;

    // Update user profile image
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: base64Image },
      select: {
        id: true,
        profileImage: true,
        email: true,
        walletAddress: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      imageUrl: base64Image
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload/profile - Remove profile picture
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Remove profile image
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
      select: {
        id: true,
        profileImage: true,
        email: true,
        walletAddress: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error removing profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to remove profile picture' },
      { status: 500 }
    );
  }
}