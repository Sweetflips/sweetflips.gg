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
  const { isLoggedIn, loading } = useAuth();

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
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const initializeChat = async () => {
    try {
      const response = await fetch("/api/chat/rooms");
      if (response.ok) {
        const data = await response.json();
        if (data.rooms.length > 0) {
          setSelectedRoomId(data.rooms[0].id);
          setSelectedRoomName(data.rooms[0].name);
        } else {
          // Create general room if none exists
          const createResponse = await fetch("/api/chat/rooms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
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
      const response = await fetch("/api/chat/rooms");
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
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Chat</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect with other users in real-time
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden" style={{ height: "calc(100vh - 250px)" }}>
          <div className="flex h-full">
            <ChatSidebar
              selectedRoomId={selectedRoomId || undefined}
              onRoomSelect={handleRoomSelect}
            />
            
            {selectedRoomId ? (
              <div className="flex-1">
                <ChatRoom
                  roomId={selectedRoomId}
                  roomName={selectedRoomName}
                  currentUserId={currentUser.id}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Select a chat room to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}