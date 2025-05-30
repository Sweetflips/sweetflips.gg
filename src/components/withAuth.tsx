import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies'; // Install nookies for cookie handling

export const withAuth = (WrappedComponent: React.FC) => {
  const Wrapper: React.FC = (props) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const cookies = parseCookies();
        const token = cookies.token;

        if (token) {
          try {
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Token validation failed:', error);
            setIsAuthenticated(false);
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            router.push('/auth/signin');
          }
        } else {
          setIsAuthenticated(false);
          // Redirect to login page
          router.push('/auth/signin');
        }
        setLoading(false);
      };

      checkAuth();
    }, [router]);

    if (loading) {
      return <p>Loading...</p>;
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };

  return Wrapper;
};
