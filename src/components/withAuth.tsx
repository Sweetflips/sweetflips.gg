import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import { jwtDecode } from 'jwt-decode'; // Assuming jwt-decode is installed

interface WithAuthOptions {
  role?: string;
}

interface DecodedToken {
  isAdmin?: boolean;
  // Add other token properties if needed
}

export const withAuth = (WrappedComponent: React.FC<any>, options?: WithAuthOptions) => {
  const Wrapper: React.FC<any> = (props) => {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = () => {
        const cookies = parseCookies();
        const token = cookies.access_token;

        if (!token) {
          router.push('/auth/signin');
          return;
        }

        try {
          const decodedToken = jwtDecode<DecodedToken>(token);
          let userHasRequiredRole = true;

          if (options?.role === 'admin') {
            if (!decodedToken.isAdmin) {
              userHasRequiredRole = false;
              router.push('/'); // Redirect non-admins to home page
            }
          }

          if (userHasRequiredRole) {
            setIsAuthorized(true);
          }
        } catch (error) {
          console.error('Token validation or decoding failed:', error);
          // Clear potentially invalid cookie
          document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
          router.push('/auth/signin');
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (loading) {
      // You might want a more sophisticated loading indicator
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return isAuthorized ? <WrappedComponent {...props} /> : null; // Render null or a redirect component if not authorized
  };

  Wrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Wrapper;
};
