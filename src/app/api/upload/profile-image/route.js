import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Verify JWT token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    console.log('Decoded token:', user);
    if (!user || !user.id) {
      console.error('Token verification failed or user ID missing:', user);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('profileImage');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
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

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${user.id}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const imageUrl = `/uploads/profiles/${fileName}`;

    // Update user profile in database
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: imageUrl }
    });

    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}