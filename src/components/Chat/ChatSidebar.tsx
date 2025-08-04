"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ChatRoom {
  id: string;
  name: string;
  isPrivate: boolean;
  memberCount?: number;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
}

interface ChatSidebarProps {
  selectedRoomId?: string;
  onRoomSelect: (roomId: string) => void;
}

export default function ChatSidebar({ selectedRoomId, onRoomSelect }: ChatSidebarProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/chat/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRoomName,
          isPrivate: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRooms([...rooms, data.room]);
        setNewRoomName("");
        setIsCreating(false);
        onRoomSelect(data.room.id);
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Chat Rooms</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreating(true)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        </div>

        {isCreating && (
          <form onSubmit={createRoom} className="mb-4">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name..."
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="flex-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewRoomName("");
                }}
                className="flex-1 px-3 py-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No chat rooms yet. Create one to get started!
          </div>
        ) : (
          <div className="p-2">
            {rooms.map((room) => (
              <motion.button
                key={room.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRoomSelect(room.id)}
                className={`w-full p-3 mb-2 rounded-lg text-left transition-colors ${
                  selectedRoomId === room.id
                    ? "bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {room.isPrivate && (
                      <span className="inline-block w-4 h-4 mr-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                    {room.name}
                  </h4>
                  {room.memberCount && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {room.memberCount} members
                    </span>
                  )}
                </div>
                {room.lastMessage && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {room.lastMessage.content}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}