"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "../../components/PageLayout";
import { useRequireAuth } from "../../hooks/useAuth";
import { useUser } from "../../context/UserContext";

export default function EditProfile() {
  const router = useRouter();
  const { user: authUser, loading } = useRequireAuth();
  const { updateProfile, refreshUser, error } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    favoriteGenres: "",
    birthdate: "",
    country: "",
    profileImage: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.username || "",
        gender: authUser.gender || "",
        favoriteGenres: authUser.favoriteGenres || "",
        birthdate: authUser.birthdate ? authUser.birthdate.split("T")[0] : "",
        country: authUser.country || "",
        profileImage: authUser.profileImage || "",
      });
      setImagePreview(authUser.profileImage || "/images/h-1.png");
    }
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Show preview immediately
    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    
    try {
      // Upload to backend
      const formDataUpload = new FormData();
      formDataUpload.append("profileImage", file);
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/upload/profile-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      
      const data = await response.json();
      
      if (response.ok && data.imageUrl) {
        setFormData((prev) => ({ ...prev, profileImage: data.imageUrl }));
        // Refresh user data to update header navigation
        await refreshUser();
        alert('Profile image uploaded successfully!');
      } else {
        alert(data.error || 'Failed to upload image');
        // Reset preview on error
        setImagePreview(authUser?.profileImage || "/images/h-1.png");
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      // Reset preview on error
      setImagePreview(authUser?.profileImage || "/images/h-1.png");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare data for API
    const updateData = {
      name: formData.name,
      gender: formData.gender.toLowerCase(),
      favoriteGenres: formData.favoriteGenres
        ? formData.favoriteGenres
            .split(",")
            .map((g) => g.trim())
            .filter((g) => g)
        : [],
      birthdate: formData.birthdate,
      country: formData.country,
      profileImage: formData.profileImage,
    };

    const result = await updateProfile(updateData);
    if (result.success) {
      alert("Profile updated successfully!");
      router.push("/profile");
    } else {
      alert(`Failed to update profile: ${result.error}`);
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
      <div className="max-w-lg mx-auto p-6 bg-white shadow rounded mt-8">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col space-y-4">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={imagePreview || "/images/h-1.png"}
                alt="Profile"
                className={`w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg transition-opacity ${
                  isUploading ? 'opacity-50' : 'opacity-100'
                }`}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <div className={`absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                <label htmlFor="profileImage" className={`cursor-pointer ${isUploading ? 'cursor-not-allowed' : ''}`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
            </div>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              {isUploading ? (
                <span className="text-blue-600">Uploading image...</span>
              ) : (
                <>
                  Click the camera icon to upload a new profile photo
                  <br />
                  <span className="text-xs text-gray-400">Max size: 5MB • Formats: JPG, PNG, GIF</span>
                </>
              )}
            </p>
          </div>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            type="text"
            name="favoriteGenres"
            value={formData.favoriteGenres}
            onChange={handleChange}
            placeholder="Favorite Genres (comma separated)"
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
