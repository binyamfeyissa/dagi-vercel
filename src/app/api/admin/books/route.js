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

// GET - Fetch all books
export async function GET(request) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const books = await prisma.book.findMany({
      include: {
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    // Calculate average rating for each book
    const booksWithRatings = books.map(book => ({
      ...book,
      averageRating: book.reviews.length > 0 
        ? book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length
        : 0,
      reviewCount: book._count.reviews
    }));

    return NextResponse.json(booksWithRatings);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new book
export async function POST(request) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { title, author, description, coverUrl, publishedYr } = await request.json();

    if (!title || !author) {
      return NextResponse.json(
        { message: 'Title and author are required' },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description: description || null,
        coverUrl: coverUrl || null,
        publishedYr: publishedYr || null
      }
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}