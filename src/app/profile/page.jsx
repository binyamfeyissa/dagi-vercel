"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PageLayout from "../../components/PageLayout";
import { useRequireAuth } from "../../hooks/useAuth";
import { useUser } from "../../context/UserContext";

export default function Profile() {
  const router = useRouter();
  const { user: authUser, loading } = useRequireAuth();
  const { logout, apiRequest } = useUser();
  const [bookCounts, setBookCounts] = useState({
    wantToRead: 0,
    currentlyReading: 0,
    read: 0,
  });

  // Fetch book counts
  useEffect(() => {
    const fetchBookCounts = async () => {
      if (!authUser) return;
      try {
        const response = await apiRequest("/api/auth/status");
        const data = await response.json();
        if (response.ok) {
          const wantToRead = (data || []).filter(
            (item) => item.status === "want_to_read"
          ).length;
          const currentlyReading = (data || []).filter(
            (item) => item.status === "reading"
          ).length;
          const read = (data || []).filter(
            (item) => item.status === "read"
          ).length;
          setBookCounts({ wantToRead, currentlyReading, read });
        }
      } catch (error) {
        console.error("Failed to fetch book counts:", error);
      }
    };
    fetchBookCounts();
  }, [authUser, apiRequest]);

  const handleLogout = () => {
    logout();
    router.push("/login");
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

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  // Format genres if available
  const formatGenres = (genresString) => {
    if (!genresString) return "No genres selected";
    return genresString;
  };

  return (
    <PageLayout>
      <div className="bg-[#f5fce6] min-h-screen flex flex-col items-center">
        {/* Top navigation spacing */}
        <h1 className="text-2xl font-bold text-blue-700 mt-6 mb-4">Profile</h1>

        {/* Profile Card */}
        <div className="bg-[#fdfaf3] shadow-md rounded-lg w-11/12 md:w-3/4 p-6 flex flex-col md:flex-row gap-6 items-start">
          {/* Left - Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={authUser?.profileImage || "/images/h-1.png"}
                alt="Profile"
                className="w-32 h-32 rounded-lg object-cover shadow-lg border-2 border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link
                  href="/edit-profile"
                  className="text-white text-sm bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition"
                >
                  Change Photo
                </Link>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {authUser?.gender || "Not set"}, {authUser?.country || "Not set"}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              📅 Birth Day: {formatDate(authUser?.birthdate)}
            </p>
          </div>

          {/* Right - User Info */}
          <div className="flex-1">
            {/* Top Row */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {authUser?.username || authUser?.email}
              </h2>
              <Link
                href="/edit-profile"
                className="px-4 py-2 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition"
              >
                Edit Profile
              </Link>
            </div>

            {/* User Email */}
            <p className="text-gray-700 mb-2">
              <span className="font-bold text-blue-700">Email:</span>{" "}
              {authUser?.email}
            </p>

            {/* Favorite Genres */}
            <p className="text-gray-700">
              <span className="font-bold text-green-700">Favorite GENRES:</span>{" "}
              {formatGenres(authUser?.favoriteGenres)}
            </p>

            {/* My Bookshelves */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">My BookShelves</h3>
              <div className="flex gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push("/want-to-read")}
                    className="bg-blue-900 text-white px-4 py-2 rounded-md shadow hover:bg-blue-800 transition text-sm"
                  >
                    Want To Read ({bookCounts.wantToRead})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-10 px-10 py-2 bg-blue-900 text-white rounded-full shadow hover:bg-blue-800 transition"
        >
          Logout
        </button>
      </div>
    </PageLayout>
  );
}
