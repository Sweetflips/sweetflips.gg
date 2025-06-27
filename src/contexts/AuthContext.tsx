import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  loading: boolean; // ✅ NEW: Add a loading state
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ NEW: Start in a loading state

  const checkUser = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setUserRole(data.user?.role || null);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } catch (err) {
      console.error("Failed to fetch user");
      setIsLoggedIn(false);
      setUserRole(null);
    } finally {
      setLoading(false); // ✅ NEW: Set loading to false when check is done
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    // ✅ NEW: Pass loading state to the provider
    <AuthContext.Provider
      value={{ isLoggedIn, userRole, loading, refreshAuth: checkUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
