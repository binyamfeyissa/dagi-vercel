'use client'

import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthButton() {
  const { user, logout, isAuthenticated } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isAuthenticated()) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Welcome, {user?.email || user?.username}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link
        href="/login"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Sign Up
      </Link>
    </div>
  );
}