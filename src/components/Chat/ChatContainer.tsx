"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PureChatRoom from "./PureChatRoom";
import PureChatSidebar from "./PureChatSidebar";
import { useSupabaseRealtimeRooms } from "@/hooks/useSupabaseRealtimeRooms";

interface ChatContainerProps {
  userId: number;
  checkAvatar?: boolean;
  onAvatarCheck?: (hasAvatar: boolean) => void;
}

export default function ChatContainer({ userId, checkAvatar = false, onAvatarCheck }: ChatContainerProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Use the rooms hook to get initial room
  const { rooms } = useSupabaseRealtimeRooms();
  
  // Auto-select first room when rooms load
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      // Select "General" room if it exists, otherwise select first room
      const generalRoom = rooms.find(r => r.name.toLowerCase() === "general");
      const roomToSelect = generalRoom || rooms[0];
      setSelectedRoomId(roomToSelect.id);
      setSelectedRoomName(roomToSelect.name);
    }
  }, [rooms, selectedRoomId]);

  const handleRoomSelect = (roomId: string, roomName: string) => {
    setSelectedRoomId(roomId);
    setSelectedRoomName(roomName);
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Community Chat</h2>
        
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

      <div className="relative bg-[#1b1324] border border-purple-700/50 rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl" style={{ height: "600px" }}>
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
                  <PureChatSidebar
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
            <PureChatSidebar
              selectedRoomId={selectedRoomId || undefined}
              onRoomSelect={handleRoomSelect}
            />
          </div>
          
          {/* Chat area */}
          {selectedRoomId ? (
            <div className="flex-1 relative">
              <PureChatRoom
                roomId={selectedRoomId}
                roomName={selectedRoomName}
                currentUserId={userId}
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
                <p className="text-base sm:text-lg text-gray-400 font-medium">
                  Loading chat rooms...
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Please wait while we connect to the chat server
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}