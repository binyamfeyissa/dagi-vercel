'use client'

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Rating from "../../../components/Rating";
import PageLayout from "../../../components/PageLayout";
import { useRequireAuth } from "../../../hooks/useAuth";
import { useUser } from "../../../context/UserContext";

const Review = () => {
  const { id } = useParams();
  const bookId = parseInt(id);
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const { apiRequest } = useUser();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !review) {
      setError("Please add a rating and review.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiRequest('/api/auth/review/add', {
        method: 'POST',
        body: JSON.stringify({
          bookId: bookId,
          rating: rating,
          reviewTxt: review,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate back to BookDetail
        router.push(`/book/${bookId}`);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Write a Review</h1>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <label className="block mb-2 font-semibold">Rate this book:</label>
          <Rating value={rating} onChange={(val) => setRating(val)} />

          {/* Review Text */}
          <textarea
            className="w-full border rounded p-2 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows="5"
            placeholder="Write your review here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default Review;