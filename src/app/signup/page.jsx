"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, loading, error, isAuthenticated } = useUser();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated()) {
    router.push("/home");
    return null;
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const result = await register(name, email, password, confirmPassword);
    if (result.success) {
      // Registration successful, redirect to login
      router.push("/login");
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
        <h1 className="text-lg font-bold">LOGO NAME</h1>
      </div>

      {/* Background Images */}
      <img
        src="/images/l_1.png"
        alt="Books"
        className="absolute bottom-0 left-4 w-70 z-0"
      />

      {/* Main Signup Card */}
      <div className="bg-[#94afec] rounded-xl shadow-xl w-[450px] h-[350px] p-8 relative z-10">
        {/* Overlapping Images */}
        <img
          src="/images/l_2.png"
          alt="Reading girl"
          className="absolute -bottom-31 -right-58 w-74 z-30"
        />
        <img
          src="/images/l_3.png"
          alt="Flying reader"
          className="absolute -top-20 -right-15 w-36 z-30"
        />

        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Sign up to get started
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {typeof error === "string" ? error : "Registration failed"}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup}>
          {/* Username */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Enter Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

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

          {/* Confirm Password */}
          <div className="mb-3">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#cbe385] hover:bg-[#b5d96f] py-2 rounded-full font-semibold disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Already have an account */}
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
