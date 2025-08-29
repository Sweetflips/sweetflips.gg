"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRealtimeRooms } from "@/hooks/useRealtimeRooms";

interface ChatSidebarProps {
  selectedRoomId?: string;
  onRoomSelect: (roomId: string, roomName?: string) => void;
  isMobile?: boolean;
}

export default function ChatSidebarRealtime({ 
  selectedRoomId, 
  onRoomSelect, 
  isMobile = false 
}: ChatSidebarProps) {
  const { rooms, isLoading, error, refetch } = useRealtimeRooms();

  const getRoomIcon = (room: any) => {
    if (room.isPrivate) {
      return (
        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      );
    }
    return <span className="text-purple-400">#</span>;
  };

  return (
    <div className={`${isMobile ? 'w-80' : 'w-64 lg:w-80'} bg-[#0d0816] border-r border-purple-700/30 flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-purple-700/30">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Channels
        </h3>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 sm:p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Loading channels...</p>
          </div>
        ) : error ? (
          <div className="p-4 sm:p-6 text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-400 mb-2">Failed to load channels</p>
            <button
              onClick={refetch}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
            >
              Retry
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-4 sm:p-6 text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-sm">No channels yet</p>
            <p className="text-xs text-gray-600 mt-1">Create one to get started!</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {rooms.map((room) => (
              <motion.button
                key={room.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRoomSelect(room.id, room.name)}
                className={`w-full p-4 rounded-xl text-left transition-all relative overflow-hidden group ${
                  selectedRoomId === room.id
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50"
                    : "bg-[#2a1b3d]/30 hover:bg-[#2a1b3d]/50 border border-transparent"
                }`}
              >
                {selectedRoomId === room.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse" />
                )}
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white flex items-center gap-1">
                      {getRoomIcon(room)}
                      {room.name}
                    </h4>
                    {room.memberCount !== undefined && (
                      <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                        {room.memberCount} {room.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    )}
                  </div>
                  
                  {room.lastMessage && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400 truncate">
                        {room.lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(room.lastMessage.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Connection status footer */}
      <div className="p-3 border-t border-purple-700/30 bg-[#0d0816]/50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-[#53FC18] rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Realtime Connected</span>
        </div>
      </div>
    </div>
  );
}