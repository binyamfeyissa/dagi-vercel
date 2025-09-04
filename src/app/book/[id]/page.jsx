"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import PageLayout from "../../../components/PageLayout";
import { useRequireAuth } from "../../../hooks/useAuth";
import { useUser } from "../../../context/UserContext";

export default function BookDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const { apiRequest } = useUser();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookData = async () => {
      if (!user) return;

      try {
        // Fetch book details
        const bookResponse = await fetch(`/api/books/${id}`);
        const bookData = await bookResponse.json();

        if (bookResponse.ok) {
          setBook(bookData);
          setReviews(bookData.reviews || []);
        } else {
          setError(bookData.error || "Failed to fetch book details");
        }

        // Fetch user's book status
        const statusResponse = await apiRequest(
          `/api/auth/book-status?bookId=${id}`
        );
        const statusData = await statusResponse.json();

        if (statusResponse.ok) {
          setStatus(statusData.status);
        }

        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch book details");
        setIsLoading(false);
      }
    };

    fetchBookData();
  }, [id, user, apiRequest]);

  const handleStatusChange = async (newStatus) => {
    const previousStatus = status;
    try {
      if (newStatus === "want_to_read" && status === "want_to_read") {
        // Remove from want to read
        setStatus(null);
        const response = await apiRequest("/api/auth/status", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId: parseInt(id) }),
        });
        if (!response.ok) {
          setStatus(previousStatus);
          const data = await response.json();
          setError(data.error || "Failed to remove book status");
        }
      } else {
        // Add to want to read
        setStatus(newStatus);
        const response = await apiRequest("/api/auth/book-status", {
          method: "POST",
          body: JSON.stringify({
            bookId: parseInt(id),
            status: newStatus,
          }),
        });
        if (!response.ok) {
          setStatus(previousStatus);
          const data = await response.json();
          setError(data.error || "Failed to update book status");
        } else if (newStatus === "want_to_read") {
          // Redirect to want-to-read page after adding
          router.push("/want-to-read");
        }
      }
    } catch (err) {
      setStatus(previousStatus);
      setError("Failed to update book status");
    }
  };

  if (loading || isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (!book) {
    return (
      <PageLayout>
        <div className="p-6 text-center">
          <p className="text-xl">Book not found.</p>
          <Link href="/home" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {/* Book Info */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={book.coverUrl || "/images/h-1.webp"}
            alt={book.title}
            className="w-48 h-64 object-cover rounded shadow"
            onError={(e) => {
              e.target.src = "/images/h-1.webp";
            }}
          />
          <div>
            <h1 className="text-2xl font-bold">{book.title}</h1>
            <p className="text-gray-600 mb-2">by {book.author}</p>
            {book.publishedYr && (
              <p className="text-gray-500 text-sm mb-2">
                Published: {book.publishedYr}
              </p>
            )}
            {book.genres && book.genres.length > 0 && (
              <div className="mb-2">
                <span className="text-sm text-gray-600">Genres: </span>
                {book.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs text-gray-700 mr-1 mb-1"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            {book.rating > 0 && (
              <div className="flex items-center mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(book.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.54 1.118l-3.39-2.462a1 1 0 00-1.175 0l-3.39 2.462c-.784.57-1.838-.197-1.539-1.118l1.285-3.96a1 1 0 00-.364-1.118L2.045 9.387c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.96z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {book.rating} ({book.reviews.length} reviews)
                </span>
              </div>
            )}
            <p className="text-gray-700 mb-4">
              {book.description || "No description available."}
            </p>

            {/* Status Buttons */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => handleStatusChange("want_to_read")}
                className={`px-4 py-2 rounded transition ${
                  status === "want_to_read"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                ✅ Want to Read
              </button>
            </div>

            {/* Write Review */}
            <Link
              href={`/review/${book.id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              ✍️ Rate the book and Write a Review
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            <div className="flex items-center gap-1">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.54 1.118l-3.39-2.462a1 1 0 00-1.175 0l-3.39 2.462c-.784.57-1.838-.197-1.539-1.118l1.285-3.96a1 1 0 00-.364-1.118L2.045 9.387c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.96z" />
              </svg>
              <span className="text-gray-600">({reviews.length})</span>
            </div>
          </div>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">
              No reviews yet. Be the first to review!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 hover:border-blue-400 transition-colors">
                      <img
                        src={review.user.profileImage || "/images/h-1.png"}
                        alt={review.user.username}
                        className="w-14 h-14 object-cover"
                        onError={(e) => {
                          e.target.src = "/images/h-1.png";
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {review.user.username}
                      </h4>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.54 1.118l-3.39-2.462a1 1 0 00-1.175 0l-3.39 2.462c-.784.57-1.838-.197-1.539-1.118l1.285-3.96a1 1 0 00-.364-1.118L2.045 9.387c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.96z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm font-medium text-gray-700">
                          {review.rating}/5
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {review.reviewTxt && (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {review.reviewTxt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </PageLayout>
  );
}
