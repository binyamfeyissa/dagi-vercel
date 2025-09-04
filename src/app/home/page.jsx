'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageLayout from "../../components/PageLayout";
import { useRequireAuth } from "../../hooks/useAuth";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useRequireAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout>
      <div className="bg-[#f5f5f5] w-full min-h-screen">

        {/* Search bar */}
        <div className="flex justify-center mt-2 mb-6 px-4">
          <input
            type="text"
            placeholder="Search books or authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-3 rounded-full shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-300"
          />
        </div>

        {/* Main book cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
          {books.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">No books found in the database.</p>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <Link key={book.id} href={`/book/${book.id}`}>
                <div className="relative bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <img
                    src={book.coverUrl || "/images/h-1.webp"}
                    alt={book.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src = "/images/h-1.webp";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-black/50 backdrop-blur-sm text-white">
                    <h2 className="text-lg font-bold">{book.title}</h2>
                    <p className="text-sm">{book.author}</p>
                    {book.genres && book.genres.length > 0 && (
                      <p className="text-xs text-gray-300 mt-1">
                        {book.genres.join(", ")}
                      </p>
                    )}
                    <div className="flex mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(book.rating)
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.54 1.118l-3.39-2.462a1 1 0 00-1.175 0l-3.39 2.462c-.784.57-1.838-.197-1.539-1.118l1.285-3.96a1 1 0 00-.364-1.118L2.045 9.387c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.96z" />
                        </svg>
                      ))}
                      {book.rating > 0 && (
                        <span className="ml-2 text-sm text-gray-300">
                          {book.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;