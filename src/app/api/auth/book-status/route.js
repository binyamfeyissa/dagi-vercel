import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
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

    const { bookId, status } = await request.json();

    if (!bookId || !status) {
      return NextResponse.json(
        { error: 'Book ID and status are required' },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Upsert user book status
    const userBookStatus = await prisma.userBookStatus.upsert({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId,
        },
      },
      update: {
        status: status,
      },
      create: {
        userId: userId,
        bookId: bookId,
        status: status,
      },
    });

    return NextResponse.json({
      message: 'Book status updated successfully',
      status: userBookStatus.status,
    });
  } catch (error) {
    console.error('Error updating book status:', error);
    return NextResponse.json(
      { error: 'Failed to update book status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

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

    const { searchParams } = new URL(request.url);
    const bookId = parseInt(searchParams.get('bookId'));

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    const userBookStatus = await prisma.userBookStatus.findUnique({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId,
        },
      },
    });

    return NextResponse.json({
      status: userBookStatus?.status || null,
    });
  } catch (error) {
    console.error('Error fetching book status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}