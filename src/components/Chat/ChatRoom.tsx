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
  onOpenSidebar?: () => void;
}

export default function ChatRoom({ roomId, roomName, currentUserId, onOpenSidebar }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousMessageCount = useRef(0);
  const isInitialLoad = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef(0);
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
        setHasError(false);
        errorCountRef.current = 0; // Reset error count on success
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
      setHasError(true);
      errorCountRef.current++;
      
      // Stop polling after 5 consecutive errors
      if (errorCountRef.current >= 5 && pollingIntervalRef.current) {
        console.log("Too many errors, stopping message polling");
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [roomId, getAuthHeaders]);

  // Load initial messages
  useEffect(() => {
    // Reset state when room changes
    setIsLoading(true);
    setMessages([]);
    setNewMessage("");
    setHasError(false);
    isInitialLoad.current = true;
    previousMessageCount.current = 0;
    errorCountRef.current = 0;
    
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Initial fetch
    fetchMessages();
    
    // Set up polling for new messages with a longer interval
    pollingIntervalRef.current = setInterval(fetchMessages, 5000); // Poll every 5 seconds instead of 2
    
    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
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

  const retryFetch = () => {
    setHasError(false);
    errorCountRef.current = 0;
    fetchMessages();
    
    // Restart polling if it was stopped
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(fetchMessages, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (hasError && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 mb-4">Failed to load messages</p>
          <button
            onClick={retryFetch}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Chat header */}
      <div className="px-3 sm:px-6 py-3 sm:py-5 border-b border-purple-700/30 bg-[#0d0816]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {onOpenSidebar && (
              <button
                onClick={onOpenSidebar}
                className="md:hidden mr-3 p-1.5 bg-purple-600/20 border border-purple-500/30 rounded-lg"
              >
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center">
                <span className="text-purple-400 mr-1 sm:mr-2">#</span>
                {roomName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                {messages.length} messages
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {hasError ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-red-400">Connection Error</span>
                <button
                  onClick={retryFetch}
                  className="ml-2 text-xs text-purple-400 hover:text-purple-300"
                >
                  Retry
                </button>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-[#53FC18] rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-400">Live</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
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
                        {/* Hover preview of full avatar - desktop only */}
                        {message.user.avatar?.base64Image && (
                          <div className="absolute z-50 hidden sm:group-hover:block bottom-12 left-0 p-2 bg-[#0d0816] rounded-lg shadow-xl border border-purple-500/30">
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
                  } max-w-[85%] sm:max-w-[70%]`}
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
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl ${
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
      <form onSubmit={sendMessage} className="p-3 sm:p-6 border-t border-purple-700/30 bg-[#0d0816]/50 backdrop-blur-sm">
        <div className="flex gap-2 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 sm:px-5 py-2.5 sm:py-3 bg-[#2a1b3d] border border-purple-700/50 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg sm:rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </form>
    </div>
  );
}