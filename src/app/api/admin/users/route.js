import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to verify admin token
function verifyAdminToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

// GET - Fetch all users
export async function GET(request) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        country: true,
        gender: true,
        favoriteGenres: true,
        birthdate: true,
        createdAt: true,
        profileImage: true,
        _count: {
          select: {
            reviews: true,
            UserBookStatus: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add additional stats for each user
    const usersWithStats = users.map(user => ({
      ...user,
      reviewCount: user._count.reviews,
      booksCount: user._count.UserBookStatus
    }));

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}