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

// PUT - Update book
export async function PUT(request, { params }) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const bookId = parseInt(params.id);
    const { title, author, description, coverUrl, publishedYr } = await request.json();

    if (!title || !author) {
      return NextResponse.json(
        { message: 'Title and author are required' },
        { status: 400 }
      );
    }

    const book = await prisma.book.update({
      where: { id: bookId },
      data: {
        title,
        author,
        description: description || null,
        coverUrl: coverUrl || null,
        publishedYr: publishedYr || null
      }
    });

    return NextResponse.json(book);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      );
    }
    console.error('Error updating book:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete book
export async function DELETE(request, { params }) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const bookId = parseInt(params.id);

    // Delete related records first
    await prisma.review.deleteMany({
      where: { bookId }
    });

    await prisma.userBookStatus.deleteMany({
      where: { bookId }
    });

    await prisma.bookGenre.deleteMany({
      where: { bookId }
    });

    // Delete the book
    await prisma.book.delete({
      where: { id: bookId }
    });

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      );
    }
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}