'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0, totalReviews: 0, totalContacts: 0 });
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const router = useRouter();

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    coverUrl: '',
    publishedYr: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch books
      const booksResponse = await fetch('/api/admin/books', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (booksResponse.ok) {
        const booksData = await booksResponse.json();
        setBooks(booksData);
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch contacts
      const contactsResponse = await fetch('/api/admin/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData);
      }

      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    try {
      const url = editingBook 
        ? `/api/admin/books/${editingBook.id}` 
        : '/api/admin/books';
      
      const method = editingBook ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...bookForm,
          publishedYr: bookForm.publishedYr ? parseInt(bookForm.publishedYr) : null
        })
      });

      if (response.ok) {
        fetchData();
        setShowBookModal(false);
        setEditingBook(null);
        setBookForm({
          title: '',
          author: '',
          description: '',
          coverUrl: '',
          publishedYr: ''
        });
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      description: book.description || '',
      coverUrl: book.coverUrl || '',
      publishedYr: book.publishedYr ? book.publishedYr.toString() : ''
    });
    setShowBookModal(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to delete this contact message?')) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`/api/admin/contacts?id=${contactId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">B</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Books</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalBooks}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">U</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">R</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Reviews</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalReviews}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">C</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Contact Messages</dt>
                    <dd className="text-lg font-medium text-gray-900">{contacts.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('books')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Books Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users List
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contact Messages
            </button>
          </nav>
        </div>

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Books Management</h2>
              <button
                onClick={() => setShowBookModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Add New Book
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {books.map((book) => (
                  <li key={book.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {book.coverUrl && (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="h-16 w-12 object-cover rounded mr-4"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{book.title}</h3>
                          <p className="text-sm text-gray-500">by {book.author}</p>
                          {book.publishedYr && (
                            <p className="text-sm text-gray-500">Published: {book.publishedYr}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Users List</h2>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.country || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Messages</h2>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {contacts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No contact messages yet.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <li key={contact.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
                              <p className="text-sm text-gray-500">{contact.email}</p>
                              <p className="text-xs text-gray-400">
                                From: {contact.user.username} • {new Date(contact.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{contact.message}</p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h3>
              <form onSubmit={handleBookSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={bookForm.title}
                    onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={bookForm.description}
                    onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cover URL</label>
                  <input
                    type="url"
                    value={bookForm.coverUrl}
                    onChange={(e) => setBookForm({...bookForm, coverUrl: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Published Year</label>
                  <input
                    type="number"
                    value={bookForm.publishedYr}
                    onChange={(e) => setBookForm({...bookForm, publishedYr: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookModal(false);
                      setEditingBook(null);
                      setBookForm({
                        title: '',
                        author: '',
                        description: '',
                        coverUrl: '',
                        publishedYr: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    {editingBook ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}