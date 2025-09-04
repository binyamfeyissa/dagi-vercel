'use client'

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

const Login = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated()) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return null; // This component just handles routing
};

export default Login;