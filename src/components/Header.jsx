import Link from "next/link";
import AuthButton from "./AuthButton";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { isAuthenticated, user } = useUser();

  return (
    <header className="bg-[#f9fbe7] text-black p-4 flex justify-between items-center">
      <Link href="/home" className="text-xl font-bold hover:text-blue-600">
        📚 Book Review
      </Link>

      <nav className="flex items-center space-x-6">
        {isAuthenticated() ? (
          <>
            <Link href="/home" className="hover:underline">
              Home
            </Link>
            <Link href="/want-to-read" className="hover:underline">
              Want to Read
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>

            {/* Profile picture */}
            <Link href="/profile" className="relative group">
              <img
                src={user?.profileImage || "/images/h-1.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 object-cover shadow-sm"
              />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                View Profile
              </div>
            </Link>
          </>
        ) : (
          <AuthButton />
        )}
      </nav>
    </header>
  );
}
