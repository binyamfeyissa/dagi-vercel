'use client'

import { useState } from "react";
import PageLayout from "../../components/PageLayout";
import { useRequireAuth } from "../../hooks/useAuth";
import { useUser } from "../../context/UserContext";

export default function Contact() {
  const { user, loading } = useRequireAuth();
  const { apiRequest } = useUser();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with user data
  useState(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await apiRequest('/api/auth/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ ...formData, message: "" }); // Clear message but keep name/email
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
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
      <div className="p-6 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4">📩 Contact Us</h2>
        
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Message sent successfully!
          </div>
        )}
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            required
            rows="5"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </PageLayout>
  );
}