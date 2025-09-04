import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminNavigation() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  return (
    <nav className="bg-indigo-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/admin/dashboard" className="text-xl font-bold">
            Admin Panel
          </Link>
          <div className="flex space-x-4">
            <Link href="/admin/dashboard" className="hover:text-indigo-200">
              Dashboard
            </Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}