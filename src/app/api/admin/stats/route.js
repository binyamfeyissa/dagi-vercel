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

// GET - Fetch dashboard statistics
export async function GET(request) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const [totalBooks, totalUsers, totalReviews, totalContacts] = await Promise.all([
      prisma.book.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.contact.count()
    ]);

    const stats = {
      totalBooks,
      totalUsers,
      totalReviews,
      totalContacts
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}