"use client";

import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, isAuthenticated } = useUser();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated()) {
    router.push("/home");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3fce6] flex items-center justify-center relative">
      {/* Logo on top-left */}
      <div className="absolute top-6 left-6 flex items-center space-x-2 z-40">
        <img
          src="/images/l_5.png"
          alt="Logo"
          className="w-12 h-12 rounded-full"
        />
        <h1 className="text-lg font-bold">Book Review</h1>
      </div>

      {/* Background Images */}
      <img
        src="/images/l_1.png"
        alt="Books"
        className="absolute bottom-0 left-4 w-70 z-0"
      />

      {/* Main Login Card */}
      <div className="bg-[#94afec] rounded-xl shadow-xl w-[450px] h-[350px] p-8 relative z-10">
        {/* Overlapping Images */}
        <img
          src="/images/l_2.png"
          alt="Reading girl"
          className="absolute -bottom-31 -right-58 w-80 z-30"
        />
        <img
          src="/images/l_3.png"
          alt="Flying reader"
          className="absolute -top-20 -right-15 w-38 z-30"
        />

        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Login to Continue
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#cbe385] hover:bg-[#b5d96f] py-2 rounded-full font-semibold disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* l_4 image */}
        <img
          src="/images/l_4.png"
          alt="Tree & reader"
          className="absolute bottom-0 left-0 w-28 z-30"
        />

        {/* Sign Up link */}
        <p className="text-center mt-4 text-sm">
          New User?{" "}
          <Link
            href="/signup"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
