"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // We still need this to update the URL
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import Loader from "@/components/common/Loader";
import TokenExchange from "@/components/TokenExchange/TokenExchange";
import UserOrders from "@/components/UserOrders/UserOrders";
import { withAuth } from "@/components/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import ChatContainer from "@/components/Chat/ChatContainer";
import { motion, AnimatePresence } from "framer-motion";

const ProfilePage = () => {
  const router = useRouter(); // Initialize router to manage URL history
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "details" | "orders" | "tokens" | "chat"
  >("details");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [hasAvatar, setHasAvatar] = useState<boolean | null>(null);
  const [checkingAvatar, setCheckingAvatar] = useState(false);
  const { logout, supabaseClient } = useAuth();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      // Build headers - add Supabase auth if available
      const headers: HeadersInit = {};
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      // Call unified endpoint that handles both Kick and Supabase auth
      const res = await fetch("/api/user/profile", { headers });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setUserData(data.userData);
      } else {
        console.error("Failed to fetch user:", res.status, res.statusText);
        setUser(null);
        setUserData(null);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [supabaseClient]);

  useEffect(() => {
    // Handles browser back/forward and direct URL loads
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#orders") setActiveSection("orders");
      else if (hash === "#tokens") setActiveSection("tokens");
      else if (hash === "#chat") setActiveSection("chat");
      else setActiveSection("details");
    };

    // ✅ Handles the custom event from the '+' button
    const handleTokensTabEvent = () => {
      setActiveSection("tokens");
    };

    // Run on initial component mount to set the correct tab
    handleHashChange();

    // Listen for hash changes (e.g., from browser back/forward or the '+' button)
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("navigate-to-tokens-tab", handleTokensTabEvent);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener(
        "navigate-to-tokens-tab",
        handleTokensTabEvent,
      );
    };
  }, []); // Empty dependency array ensures this runs only once to set up the listener

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Check avatar when chat tab is active (non-blocking)
  useEffect(() => {
    if (activeSection === "chat" && user?.id) {
      // Don't block chat loading on avatar check
      checkUserAvatar(user.id);
    }
  }, [activeSection, user]);

  const checkUserAvatar = async (userId: number) => {
    try {
      setCheckingAvatar(true);
      if (!userId || userId <= 0) {
        console.error("Invalid userId for avatar check:", userId);
        setHasAvatar(false);
        return;
      }
      
      const headers: HeadersInit = {};
      
      // Add authorization header for Supabase users
      if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }
      
      const response = await fetch(`/api/avatar/${userId}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        let hasValidAvatar = false;
        
        if (data.success && data.avatar) {
          hasValidAvatar = !!(
            data.avatar.Base64Image || 
            data.avatar.base64Image ||
            data.Base64Image ||
            data.base64Image
          );
        }
        
        setHasAvatar(hasValidAvatar);
      } else if (response.status === 404) {
        setHasAvatar(false);
      } else {
        setHasAvatar(false);
      }
    } catch (error) {
      console.error("Error checking avatar:", error);
      setHasAvatar(false);
    } finally {
      setCheckingAvatar(false);
    }
  };


  const handleSetupAvatar = () => {
    // Redirect to Unity WebGL avatar creator
    window.location.href = "/webgl/index.html";
  };

  // This function now reliably updates state AND the URL
  const handleTabClick = (section: "details" | "orders" | "tokens" | "chat") => {
    // 1. Update the state directly for an immediate UI change.
    setActiveSection(section);
    // 2. Use the router to update the URL hash without a full page reload.
    router.push(`/account#${section}`, { scroll: false });
  };

  const handleSyncBotrix = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      // First try without additional auth (for Kick users)
      let res = await fetch("/api/user/sync-botrix", { method: "POST" });
      
      // If unauthorized, try with Supabase auth
      if (res.status === 401) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session?.access_token) {
          setSyncMessage("❌ Not authenticated");
          setSyncing(false);
          setTimeout(() => setSyncMessage(null), 3000);
          return;
        }

        res = await fetch("/api/user/sync-botrix", { 
          method: "POST",
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
      }

      const data = await res.json();
      if (res.ok) {
        setSyncMessage("✅ Synced successfully");
        fetchUser(); // refresh token balance and points
      } else {
        setSyncMessage(`❌ ${data.error || "Failed to sync"}`);
      }
    } catch (err) {
      setSyncMessage("❌ Error syncing data");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  if (loading)
    return (
      <div className="p-6">
        <Loader />
      </div>
    );

  return (
    <DefaultLayout>
      <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-6 text-[#DEE4EE]">
        <nav className="mb-6 flex flex-col gap-2 border-b border-white pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              onClick={() => handleTabClick("details")}
              className={`rounded-xl px-3 py-1.5 text-sm transition hover:bg-[#9925FE] sm:px-4 sm:py-2 sm:text-base ${activeSection === "details" ? "bg-[#9925FE] font-semibold text-white shadow-md" : "border border-purple-500 bg-purple-800/40 text-white"}`}
            >
              Account Details
            </button>
            <button
              onClick={() => handleTabClick("orders")}
              className={`rounded-xl px-3 py-1.5 text-sm transition hover:bg-[#9925FE] sm:px-4 sm:py-2 sm:text-base ${activeSection === "orders" ? "bg-[#9925FE] font-semibold text-white shadow-md" : "border border-purple-500 bg-purple-800/40 text-white"}`}
            >
              Orders
            </button>
            <button
              onClick={() => handleTabClick("tokens")}
              className={`rounded-xl px-3 py-1.5 text-sm transition hover:bg-[#9925FE] sm:px-4 sm:py-2 sm:text-base ${activeSection === "tokens" ? "bg-[#9925FE] font-semibold text-white shadow-md" : "border border-purple-500 bg-purple-800/40 text-white"}`}
            >
              Tokens
            </button>
            <button
              onClick={() => handleTabClick("chat")}
              className={`rounded-xl px-3 py-1.5 text-sm transition hover:bg-[#9925FE] sm:px-4 sm:py-2 sm:text-base ${activeSection === "chat" ? "bg-[#9925FE] font-semibold text-white shadow-md" : "border border-purple-500 bg-purple-800/40 text-white"}`}
            >
              Chat
            </button>
            <button
              onClick={handleSyncBotrix}
              disabled={syncing}
              className="rounded-xl border border-[#9925FE] bg-[#130c1a] px-3 py-1.5 text-sm text-white transition hover:bg-[#9925FE] disabled:opacity-50 sm:px-4 sm:py-2 sm:text-base"
            >
              {syncing ? "Syncing..." : "Refresh Tokens"}
            </button>
          </div>

          <div className="flex justify-center sm:ml-auto sm:justify-end">
            <button
              onClick={logout}
              className="rounded-xl bg-[#9925FE] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-opacity-90 sm:text-base"
            >
              Logout
            </button>
          </div>

          {syncMessage && (
            <div className="mt-2 w-full text-center text-sm text-white">
              {syncMessage}
            </div>
          )}
        </nav>

        <section>
          {activeSection === "details" && user && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Account Details</h2>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          )}

          {activeSection === "orders" && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Your Orders</h2>
              <UserOrders />
            </div>
          )}

          {activeSection === "tokens" && user && userData && (
            <div>
              <TokenExchange
                user={user}
                available={userData.points - userData.converted_tokens}
                onConverted={fetchUser}
              />
            </div>
          )}

          {activeSection === "chat" && user && (
            <>
              <ChatContainer 
                userId={user.id}
                checkAvatar={false}
                onAvatarCheck={(hasAvatar) => setHasAvatar(hasAvatar)}
              />

              {/* Avatar Setup Modal - now overlays on top of chat */}
              <AnimatePresence>
                {hasAvatar === false && !checkingAvatar && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />
                    
                    {/* Modal */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                      <div className="bg-[#1b1324] border border-purple-700/50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
                        
                        <div className="relative p-8">
                          <div className="mb-6 flex justify-center">
                            <div className="relative">
                              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50" />
                              <div className="relative w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                            Create Your Avatar
                          </h2>
                          
                          <p className="text-gray-300 text-center mb-2">
                            To join the Sweetflips chat, you need to create your unique 3D avatar!
                          </p>
                          
                          <p className="text-gray-400 text-sm text-center mb-8">
                            Express yourself with a personalized Ready Player Me avatar that represents you in our community.
                          </p>
                          
                          <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-300">Customize your appearance</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-300">Show your style in chat</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-300">Quick and easy setup</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSetupAvatar}
                              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
                            >
                              Setup My Avatar
                            </motion.button>
                            
                            <button
                              onClick={() => {
                                setCheckingAvatar(true);
                                if (user?.id) {
                                  checkUserAvatar(user.id);
                                }
                              }}
                              className="w-full py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                            >
                              Already have an avatar? Click to refresh
                            </button>
                          </div>
                          
                          <p className="text-xs text-gray-500 text-center mt-4">
                            Takes only 2-3 minutes to create
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}
        </section>
      </div>
    </DefaultLayout>
  );
};

export default withAuth(ProfilePage);
