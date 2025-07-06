import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClientForAuth } from "../../lib/supabase";

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  loading: boolean;
  supabaseUser: any;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  const checkUser = async () => {
    try {
      // Check existing API authentication
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setUserRole(data.user?.role || null);
        setSupabaseUser(null); // Clear Supabase user when API auth is working
      } else {
        // API auth failed, check Supabase authentication (only on client side)
        if (typeof window !== 'undefined') {
          const supabase = createClientForAuth();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && user.email_confirmed_at) {
            setIsLoggedIn(true);
            setSupabaseUser(user);
            setUserRole(null); // Supabase users might not have roles initially
          } else {
            setIsLoggedIn(false);
            setUserRole(null);
            setSupabaseUser(null);
          }
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
          setSupabaseUser(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user");
      setIsLoggedIn(false);
      setUserRole(null);
      setSupabaseUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    
    // Listen for Supabase auth changes (only on client side)
    if (typeof window !== 'undefined') {
      const supabase = createClientForAuth();
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
            setIsLoggedIn(true);
            setSupabaseUser(session.user);
          } else if (event === 'SIGNED_OUT') {
            setIsLoggedIn(false);
            setSupabaseUser(null);
            setUserRole(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userRole, loading, supabaseUser, refreshAuth: checkUser }}
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
