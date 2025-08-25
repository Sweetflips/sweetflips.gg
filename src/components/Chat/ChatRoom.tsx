"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Avatar will be loaded from the new avatar system
import { useAuthHeaders } from "@/hooks/useAuthHeaders";

interface Message {
  id: string;
  content: string;
  userId: number;
  user: {
    id: number;
    username: string;
    avatar?: { // Avatar from database
      base64Image?: string | null;
      avatarId?: string;
      gender?: string;
    } | null;
  };
  createdAt: string;
}

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  currentUserId: number;
}

export default function ChatRoom({ roomId, roomName, currentUserId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousMessageCount = useRef(0);
  const isInitialLoad = useRef(true);
  const { getAuthHeaders, getAuthHeadersWithContentType } = useAuthHeaders();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only auto-scroll if this is a new message (not initial load)
    if (!isInitialLoad.current && messages.length > previousMessageCount.current) {
      scrollToBottom();
    }
    previousMessageCount.current = messages.length;
    
    // After initial load, allow auto-scrolling
    if (isInitialLoad.current && messages.length > 0) {
      isInitialLoad.current = false;
    }
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, { headers });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    }
  }, [roomId, getAuthHeaders]);

  // Load initial messages
  useEffect(() => {
    // Reset initial load flag when room changes
    isInitialLoad.current = true;
    previousMessageCount.current = 0;
    
    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [roomId, fetchMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage;
    setNewMessage("");

    try {
      const headers = await getAuthHeadersWithContentType();
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: messageContent,
        }),
      });

      if (response.ok) {
        // Message sent successfully, will be fetched in next poll
        inputRef.current?.focus();
        // Scroll to bottom after sending message
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Chat header */}
      <div className="px-6 py-5 border-b border-purple-700/30 bg-[#0d0816]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="text-purple-400 mr-2">#</span>
              {roomName}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {messages.length} messages
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#53FC18] rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Live</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isCurrentUser = message.userId === currentUserId;
            const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 ${
                  isCurrentUser ? "flex-row-reverse" : ""
                }`}
              >
                {showAvatar ? (
                  <div className="flex-shrink-0 relative group">
                    {(message.user.avatar?.base64Image) ? (
                      <>
                        <img
                          src={message.user.avatar.base64Image}
                          alt={message.user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30 transition-transform group-hover:scale-110 cursor-pointer"
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        {/* Hover preview of full avatar */}
                        {message.user.avatar?.base64Image && (
                          <div className="absolute z-50 hidden group-hover:block bottom-12 left-0 p-2 bg-[#0d0816] rounded-lg shadow-xl border border-purple-500/30">
                            <img
                              src={message.user.avatar.base64Image}
                              alt={`${message.user.username}'s avatar`}
                              className="w-32 h-32 rounded-lg object-cover"
                            />
                            <div className="mt-2 text-xs text-center text-gray-400">
                              {message.user.username}
                            </div>
                            {message.user.avatar?.avatarId && (
                              <div className="mt-1 text-xs text-center">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                                  3D Avatar
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : null}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/20 ${
                      message.user.avatar?.base64Image ? 'hidden' : ''
                    }`}>
                      {message.user.username[0].toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="w-10 flex-shrink-0" />
                )}

                <div
                  className={`flex flex-col ${
                    isCurrentUser ? "items-end" : "items-start"
                  } max-w-[70%]`}
                >
                  {showAvatar && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${
                        isCurrentUser ? "text-purple-400" : "text-purple-300"
                      }`}>
                        {message.user.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                        : "bg-[#2a1b3d] text-gray-100 border border-purple-700/30"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="p-6 border-t border-purple-700/30 bg-[#0d0816]/50 backdrop-blur-sm">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3 bg-[#2a1b3d] border border-purple-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </form>
    </div>
  );
}