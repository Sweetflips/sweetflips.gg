"use client";

import ChatRoom from "@/components/Chat/ChatRoom";
import ChatSidebar from "@/components/Chat/ChatSidebar";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasAvatar, setHasAvatar] = useState<boolean | null>(null);
  const [checkingAvatar, setCheckingAvatar] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoggedIn, loading, supabaseClient } = useAuth();
  const router = useRouter();

  const checkUserAvatar = useCallback(async (userId: number) => {
    try {
      if (!userId || userId <= 0) {
        console.error("Invalid userId for avatar check:", userId);
        setHasAvatar(false);
        setCheckingAvatar(false);
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
        console.error("Error checking avatar status:", response.status);
        setHasAvatar(false);
      }
    } catch (error) {
      console.error("Error checking avatar:", error);
      setHasAvatar(false);
    } finally {
      setCheckingAvatar(false);
    }
  }, [supabaseClient]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      // First try the new endpoint that handles both auth types
      const headers: HeadersInit = {};

      // If we have a Supabase user, add the authorization header
      if (isLoggedIn && currentUser === null && supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch("/api/auth/current-user", { headers });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);

        // Check if user has an avatar
        await checkUserAvatar(data.user.id);
      } else {
        // Fallback to old endpoint for backward compatibility
        const oldResponse = await fetch("/api/user");
        if (oldResponse.ok) {
          const data = await oldResponse.json();
          setCurrentUser(data.user);

          // Check if user has an avatar
          await checkUserAvatar(data.user.id);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setCheckingAvatar(false);
    }
  }, [isLoggedIn, currentUser, supabaseClient, checkUserAvatar]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isLoggedIn) {
      router.push('/auth/signin');
      return;
    }

    // Fetch current user data
    if (isLoggedIn) {
      fetchCurrentUser();
    }
  }, [isLoggedIn, loading, router, fetchCurrentUser]);

  const initializeChat = useCallback(async () => {
    try {
      const headers: HeadersInit = {};

      // Add authorization header for Supabase users
      if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch("/api/chat/rooms", { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.rooms.length > 0) {
          setSelectedRoomId(data.rooms[0].id);
          setSelectedRoomName(data.rooms[0].name);
        } else {
          // Create general room if none exists
          const createHeaders: HeadersInit = {
            "Content-Type": "application/json",
          };

          // Add authorization header for Supabase users
          if (supabaseClient) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session?.access_token) {
              createHeaders['Authorization'] = `Bearer ${session.access_token}`;
            }
          }

          const createResponse = await fetch("/api/chat/rooms", {
            method: "POST",
            headers: createHeaders,
            body: JSON.stringify({
              name: "General",
              isPrivate: false,
            }),
          });

          if (createResponse.ok) {
            const newRoom = await createResponse.json();
            setSelectedRoomId(newRoom.room.id);
            setSelectedRoomName(newRoom.room.name);
          }
        }
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
  }, [supabaseClient]);

  useEffect(() => {
    // Auto-select first room or create general room
    if (!selectedRoomId && currentUser) {
      initializeChat();
    }
  }, [currentUser, selectedRoomId, initializeChat]);

  useEffect(() => {
    // Check if user is coming back from avatar creation
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('avatar_created') === 'true') {
      // Force re-check avatar after a short delay
      setTimeout(() => {
        if (currentUser?.id) {
          setCheckingAvatar(true);
          checkUserAvatar(currentUser.id);
        }
      }, 1000);

      // Clean up URL
      window.history.replaceState({}, '', '/account#chat');
    }
  }, [currentUser, checkUserAvatar]);

  const handleSetupAvatar = () => {
    // Redirect to Unity WebGL avatar creator
    window.location.href = "/webgl/index.html";
  };

  const handleRoomSelect = async (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsSidebarOpen(false); // Close sidebar on mobile after room selection

    // Fetch room details to get the name
    try {
      const headers: HeadersInit = {};

      // Add authorization header for Supabase users
      if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch("/api/chat/rooms", { headers });
      if (response.ok) {
        const data = await response.json();
        const room = data.rooms.find((r: any) => r.id === roomId);
        if (room) {
          setSelectedRoomName(room.name);
        }
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  };

  if (loading || checkingAvatar) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DefaultLayout>
    );
  }

  // This should not render anymore due to redirect, but keep as fallback
  if (!isLoggedIn || !currentUser) {
    return null;
  }

  return (
    <DefaultLayout>
      {/* Avatar Setup Modal */}
      <AnimatePresence>
        {hasAvatar === false && (
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
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />

                <div className="relative p-8">
                  {/* Avatar Icon */}
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

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                    Create Your Avatar
                  </h2>

                  {/* Description */}
                  <p className="text-gray-300 text-center mb-2">
                    To join the Sweetflips chat, you need to create your unique 3D avatar!
                  </p>

                  <p className="text-gray-400 text-sm text-center mb-8">
                    Express yourself with a personalized Ready Player Me avatar that represents you in our community.
                  </p>

                  {/* Features */}
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

                  {/* Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSetupAvatar}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
                    >
                      Setup My Avatar
                    </motion.button>

                    {/* Refresh button for users who just created avatar */}
                    <button
                      onClick={() => {
                        setCheckingAvatar(true);
                        if (currentUser?.id) {
                          checkUserAvatar(currentUser.id);
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

      <div className="mx-auto max-w-screen-2xl px-2 sm:px-4">
        {/* Mobile header with menu button */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Sweetflips Chat
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-400">
                Connect with the community
              </p>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 bg-purple-600/20 border border-purple-500/30 rounded-lg"
            >
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Glow effect background - hidden on mobile for performance */}
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl" />

          <div className="relative bg-[#1b1324] border border-purple-700/50 rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

            <div className="flex h-full relative z-10">
              {/* Mobile sidebar overlay */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSidebarOpen(false)}
                      className="md:hidden fixed inset-0 bg-black/50 z-40"
                    />
                    <motion.div
                      initial={{ x: -300 }}
                      animate={{ x: 0 }}
                      exit={{ x: -300 }}
                      transition={{ type: "tween", duration: 0.3 }}
                      className="md:hidden fixed left-0 top-0 h-full z-50"
                    >
                      <ChatSidebar
                        selectedRoomId={selectedRoomId || undefined}
                        onRoomSelect={handleRoomSelect}
                        isMobile={true}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Desktop sidebar */}
              <div className="hidden md:block">
                <ChatSidebar
                  selectedRoomId={selectedRoomId || undefined}
                  onRoomSelect={handleRoomSelect}
                />
              </div>

              {selectedRoomId ? (
                <div className="flex-1 relative">
                  <ChatRoom
                    roomId={selectedRoomId}
                    roomName={selectedRoomName}
                    currentUserId={currentUser.id}
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="relative">
                      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50" />
                      <svg className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 relative text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-base sm:text-lg text-gray-400 font-medium">Select a chat room to start messaging</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Join the conversation with other Sweetflips members</p>

                    {/* Mobile prompt to open sidebar */}
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="md:hidden mt-4 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm"
                    >
                      Open Channels
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
