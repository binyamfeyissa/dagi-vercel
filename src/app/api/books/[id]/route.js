import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const bookId = parseInt(id);

        if (isNaN(bookId)) {
            return NextResponse.json(
                { error: 'Invalid book ID' },
                { status: 400 }
            );
        }

        const book = await prisma.book.findUnique({
            where: { id: bookId },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profileImage: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                genres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        if (!book) {
            return NextResponse.json(
                { error: 'Book not found' },
                { status: 404 }
            );
        }

        // Calculate average rating
        const ratings = book.reviews.map(review => review.rating);
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0;

        // Format the response
        const bookData = {
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description,
            coverUrl: book.coverUrl,
            publishedYr: book.publishedYr,
            rating: Math.round(averageRating * 10) / 10,
            genres: book.genres.map(bg => bg.genre.name),
            reviews: book.reviews.map(review => ({
                id: review.id,
                rating: review.rating,
                reviewTxt: review.reviewTxt,
                createdAt: review.createdAt,
                user: {
                    id: review.user.id,
                    username: review.user.username,
                    profileImage: review.user.profileImage,
                },
            })),
        };

        return NextResponse.json(bookData);
    } catch (error) {
        console.error('Error fetching book:', error);
        return NextResponse.json(
            { error: 'Failed to fetch book details' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}