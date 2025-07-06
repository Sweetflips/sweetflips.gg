"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const LogOut: React.FC = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return null;
};

export default LogOut;
