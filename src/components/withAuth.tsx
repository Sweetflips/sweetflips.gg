import React from 'react';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    // No redirect or login, just render the component regardless of auth state
    return <Component {...props} />;
  };
}
