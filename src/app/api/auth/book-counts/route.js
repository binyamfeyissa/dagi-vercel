import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get counts for different book statuses
    const wantToReadCount = await prisma.userBookStatus.count({
      where: {
        userId: userId,
        status: 'want-to-read',
      },
    });

    const currentlyReadingCount = await prisma.userBookStatus.count({
      where: {
        userId: userId,
        status: 'reading',
      },
    });

    const readCount = await prisma.userBookStatus.count({
      where: {
        userId: userId,
        status: 'read',
      },
    });

    return NextResponse.json({
      wantToRead: wantToReadCount,
      currentlyReading: currentlyReadingCount,
      read: readCount,
    });
  } catch (error) {
    console.error('Error fetching book counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book counts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}