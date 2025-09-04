import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

export async function PUT(request) {
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
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, gender, favoriteGenres, birthdate, country, profileImage } = body;

    // Prepare update data
    const updateData = {};
    if (name) updateData.username = name;
    if (gender) updateData.gender = gender;
    if (favoriteGenres) {
      updateData.favoriteGenres = Array.isArray(favoriteGenres) 
        ? favoriteGenres.join(',') 
        : favoriteGenres;
    }
    if (birthdate) updateData.birthdate = new Date(birthdate);
    if (country) updateData.country = country;
    if (profileImage) updateData.profileImage = profileImage;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        gender: true,
        favoriteGenres: true,
        birthdate: true,
        country: true,
        profileImage: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}