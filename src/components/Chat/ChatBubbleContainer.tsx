"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PureChatRoom from "./PureChatRoom";
import PureChatSidebar from "./PureChatSidebar";
import { useSupabaseRealtimeRooms } from "@/hooks/useSupabaseRealtimeRooms";

interface ChatBubbleContainerProps {
  userId: number;
}

export default function ChatBubbleContainer({ userId }: ChatBubbleContainerProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { rooms } = useSupabaseRealtimeRooms();
  
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
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
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-[#1b1324]/95 backdrop-blur-xl overflow-hidden">
        <div className="flex h-full">
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
          
          {/* Desktop sidebar - hidden in bubble view */}
          <div className="hidden">
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
                hideRoomHeader={true}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-400">Loading chat...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}