import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/common/Loader"; // Optional: for a better loading experience

interface WithAuthOptions {
  role?: string;
}

export const withAuth = (
  WrappedComponent: React.FC<any>,
  options?: WithAuthOptions,
) => {
  const Wrapper: React.FC<any> = (props) => {
    const { isLoggedIn, userRole, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Don't do anything while the auth state is loading
      if (loading) {
        return;
      }

      // If not logged in, redirect to sign-in page
      if (!isLoggedIn) {
        router.push("/auth/signin");
        return;
      }

      // If a specific role is required and the user doesn't have it, redirect
      if (options?.role && options.role !== userRole) {
        router.push("/"); // Redirect to home page for unauthorized role
      }
    }, [isLoggedIn, userRole, loading, router]); // Depend on auth state

    // While loading, show a loader to prevent flicker
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Loader />
        </div>
      );
    }

    // If logged in and role is correct (or not specified), render the component
    if (isLoggedIn && (!options?.role || options.role === userRole)) {
      return <WrappedComponent {...props} />;
    }

    // Return null or a loader while redirecting to prevent rendering the component
    return null;
  };

  Wrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return Wrapper;
};
