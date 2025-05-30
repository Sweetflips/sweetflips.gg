'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext'; // 🟣 Import your AuthContext

interface TokenContextType {
  tokenBalance: number | null;
  refreshTokenBalance: () => Promise<void>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const { isLoggedIn } = useAuth(); // 🟣 Get auth state

  const refreshTokenBalance = async () => {
    try {
      const res = await fetch('/api/user/tokens');
      if (res.ok) {
        const data = await res.json();
        setTokenBalance(Number(data.tokens));
      }
    } catch (error) {
      console.error('Failed to refresh token balance', error);
    }
  };

  // 🔁 Refetch token balance every time auth changes (e.g. login)
  useEffect(() => {
    if (isLoggedIn) {
      refreshTokenBalance();
    } else {
      setTokenBalance(null); // Optional: reset to null if logged out
    }
  }, [isLoggedIn]);

  return (
    <TokenContext.Provider value={{ tokenBalance, refreshTokenBalance }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};