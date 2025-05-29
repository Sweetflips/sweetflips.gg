"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LogOut: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
    router.push('/auth/logout');
  }, [router]);

  return null;
};

export default LogOut;
