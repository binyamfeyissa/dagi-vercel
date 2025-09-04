const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create genres first
  const fiction = await prisma.genre.upsert({
    where: { name: 'Fiction' },
    update: {},
    create: { name: 'Fiction' },
  });

  const romance = await prisma.genre.upsert({
    where: { name: 'Romance' },
    update: {},
    create: { name: 'Romance' },
  });

  const dystopian = await prisma.genre.upsert({
    where: { name: 'Dystopian' },
    update: {},
    create: { name: 'Dystopian' },
  });

  const classic = await prisma.genre.upsert({
    where: { name: 'Classic' },
    update: {},
    create: { name: 'Classic' },
  });

  const adventure = await prisma.genre.upsert({
    where: { name: 'Adventure' },
    update: {},
    create: { name: 'Adventure' },
  });

  // Create books
  const book1 = await prisma.book.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'A Million to One',
      author: 'Tony Faggioli',
      description: 'A gripping tale of odds, chances, and the extraordinary moments that define our lives.',
      coverUrl: 'https://www.designforwriters.com/wp-content/uploads/2017/10/design-for-writers-book-cover-tf-2-a-million-to-one.jpg',
      publishedYr: 2017,
    },
  });

  const book2 = await prisma.book.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A story of the mysterious Jay Gatsby and his love for Daisy Buchanan, set in the Jazz Age.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg',
      publishedYr: 1925,
    },
  });

  const book3 = await prisma.book.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description: 'A powerful story about racial injustice in the Deep South.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg',
      publishedYr: 1960,
    },
  });

  const book4 = await prisma.book.upsert({
    where: { id: 4 },
    update: {},
    create: {
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian novel about totalitarianism and surveillance.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg',
      publishedYr: 1949,
    },
  });

  const book5 = await prisma.book.upsert({
    where: { id: 5 },
    update: {},
    create: {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      description: 'A classic romance novel exploring love, society, and misunderstandings in 19th-century England.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg',
      publishedYr: 1813,
    },
  });

  // Create book-genre relationships
  await prisma.bookGenre.upsert({
    where: { id: 1 },
    update: {},
    create: {
      bookId: book1.id,
      genreId: fiction.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: { id: 2 },
    update: {},
    create: {
      bookId: book2.id,
      genreId: classic.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: { id: 3 },
    update: {},
    create: {
      bookId: book2.id,
      genreId: fiction.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: { id: 4 },
    update: {},
    create: {
      bookId: book3.id,
      genreId: classic.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: { id: 5 },
    update: {},
    create: {
      bookId: book3.id,
      genreId: fiction.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: { id: 6 },
    update: {},
    create: {
      bookId: book4.id,
      genreId: dystopian.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: { id: 7 },
    update: {},
    create: {
      bookId: book4.id,
      genreId: fiction.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: { id: 8 },
    update: {},
    create: {
      bookId: book5.id,
      genreId: romance.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: { id: 9 },
    update: {},
    create: {
      bookId: book5.id,
      genreId: classic.id,
    },
  });

  console.log('Database has been seeded with books and genres!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });