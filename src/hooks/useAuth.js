'use client'

import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAuth = (requireAuth = false) => {
  const { user, token, loading, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated()) {
      router.push('/login');
    }
  }, [loading, requireAuth, isAuthenticated, router]);

  return {
    user,
    token,
    loading,
    isAuthenticated: isAuthenticated(),
  };
};

export const useRequireAuth = () => {
  return useAuth(true);
};