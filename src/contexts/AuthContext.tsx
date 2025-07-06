import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClientForAuth } from "@/lib/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  loading: boolean;
  supabaseUser: any;
  refreshAuth: () => Promise<void>;
  supabaseClient: any;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a single Supabase client instance outside component
const supabaseClient = createClientForAuth();

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
          const { data: { user } } = await supabaseClient.auth.getUser();
          
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
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
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

  const logout = async () => {
    try {
      // Handle Supabase logout
      if (supabaseUser) {
        await supabaseClient.auth.signOut();
      }
      
      // Handle API logout
      await fetch("/api/auth/logout", { method: "POST" });
      
      // Clear state
      setIsLoggedIn(false);
      setUserRole(null);
      setSupabaseUser(null);
      
      // Redirect to home or login page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        isLoggedIn, 
        userRole, 
        loading, 
        supabaseUser, 
        refreshAuth: checkUser,
        supabaseClient,
        logout 
      }}
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
