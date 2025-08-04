"use client";

import { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ChatRoom from "@/components/Chat/ChatRoom";
import ChatSidebar from "@/components/Chat/ChatSidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { isLoggedIn, loading, supabaseClient } = useAuth();

  useEffect(() => {
    // Fetch current user data
    if (isLoggedIn) {
      fetchCurrentUser();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Auto-select first room or create general room
    if (!selectedRoomId && currentUser) {
      initializeChat();
    }
  }, [currentUser, selectedRoomId]);

  const fetchCurrentUser = async () => {
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
      } else {
        // Fallback to old endpoint for backward compatibility
        const oldResponse = await fetch("/api/user");
        if (oldResponse.ok) {
          const data = await oldResponse.json();
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const initializeChat = async () => {
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
  };

  const handleRoomSelect = async (roomId: string) => {
    setSelectedRoomId(roomId);
    
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

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DefaultLayout>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Please sign in to use chat
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be logged in to access the chat feature.
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Sweetflips Chat
          </h1>
          <p className="mt-2 text-gray-400">
            Connect with the community in real-time
          </p>
        </div>

        <div className="relative">
          {/* Glow effect background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl" />
          
          <div className="relative bg-[#1b1324] border border-purple-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl" style={{ height: "calc(100vh - 280px)" }}>
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
            
            <div className="flex h-full relative z-10">
              <ChatSidebar
                selectedRoomId={selectedRoomId || undefined}
                onRoomSelect={handleRoomSelect}
              />
              
              {selectedRoomId ? (
                <div className="flex-1 relative">
                  <ChatRoom
                    roomId={selectedRoomId}
                    roomName={selectedRoomName}
                    currentUserId={currentUser.id}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative">
                      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50" />
                      <svg className="w-20 h-20 mx-auto mb-6 relative text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-lg text-gray-400 font-medium">Select a chat room to start messaging</p>
                    <p className="text-sm text-gray-500 mt-2">Join the conversation with other Sweetflips members</p>
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