import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const books = await prisma.book.findMany({
            include: {
                reviews: {
                    select: {
                        rating: true,
                    },
                },
                genres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        // Calculate average rating for each book
        const booksWithRatings = books.map(book => {
            const ratings = book.reviews.map(review => review.rating);
            const averageRating = ratings.length > 0
                ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                : 0;

            return {
                id: book.id,
                title: book.title,
                author: book.author,
                description: book.description,
                coverUrl: book.coverUrl,
                publishedYr: book.publishedYr,
                rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                genres: book.genres.map(bg => bg.genre.name),
            };
        });

        return NextResponse.json(booksWithRatings);
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json(
            { error: 'Failed to fetch books' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}