"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
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
  const getAuthHeadersRef = useRef(getAuthHeaders);

  // Update ref when function changes
  useEffect(() => {
    getAuthHeadersRef.current = getAuthHeaders;
  }, [getAuthHeaders]);

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

  // Move fetchMessages inside useEffect to avoid dependency issues
  const retryFetch = () => {
    setHasError(false);
    errorCountRef.current = 0;
    // Trigger a re-fetch by updating a state variable
    setIsLoading(true);
  };

  // Load initial messages
  useEffect(() => {
    // Prevent rapid re-initialization
    if (!roomId) return;

    // Create abort controller for this effect
    const abortController = new AbortController();
    let localPollingInterval: NodeJS.Timeout | null = null;
    let localErrorCount = 0;
    let isMounted = true;

    // Define fetchMessages inside the effect to avoid dependency issues
    const fetchMessages = async () => {
      // Prevent concurrent fetches
      if (abortController.signal.aborted || !isMounted) {
        console.log("Skipping fetch - aborted or unmounted");
        return;
      }

      try {
        console.log(`Fetching messages for room: ${roomId}`);
        const headers = await getAuthHeadersRef.current();
        const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
          headers,
          signal: abortController.signal
        });

        if (abortController.signal.aborted || !isMounted) {
          console.log("Response received but component unmounted");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          console.log(`Received ${data.messages?.length || 0} messages`);
          if (isMounted) {
            setMessages(data.messages || []);
            setIsLoading(false);
            setHasError(false);
            localErrorCount = 0; // Reset error count on success
            errorCountRef.current = 0;
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error?.name === 'AbortError' || !isMounted) return;

        console.error("Error fetching messages:", error);
        if (isMounted) {
          setIsLoading(false);
          setHasError(true);
          localErrorCount++;
          errorCountRef.current = localErrorCount;
        }

        // Stop polling after 5 consecutive errors
        if (localErrorCount >= 5 && localPollingInterval) {
          console.log("Too many errors, stopping message polling");
          clearInterval(localPollingInterval);
          localPollingInterval = null;
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }
    };

    // Reset state when room changes
    console.log(`ChatRoom mounting/updating for room: ${roomId}`);
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

    // Add a small delay to prevent rapid re-fetching
    const initTimeout = setTimeout(() => {
      if (isMounted) {
        // Initial fetch
        fetchMessages();
      }
    }, 100);

    // Set up polling for new messages with a longer interval
    localPollingInterval = setInterval(() => {
      if (!abortController.signal.aborted) {
        fetchMessages();
      }
    }, 5000); // Poll every 5 seconds

    pollingIntervalRef.current = localPollingInterval;

    // Cleanup function
    return () => {
      console.log(`ChatRoom cleanup for room: ${roomId}`);
      isMounted = false; // Mark as unmounted
      clearTimeout(initTimeout); // Clear init timeout
      abortController.abort(); // Cancel any pending requests
      if (localPollingInterval) {
        clearInterval(localPollingInterval);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [roomId]); // Only depend on roomId

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

  // This function is now outside useEffect and just triggers a refresh
  const triggerRefresh = () => {
    setHasError(false);
    errorCountRef.current = 0;
    setIsLoading(true);
    setMessages(prev => [...prev]); // Force re-render to restart the effect
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
            onClick={triggerRefresh}
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
                  onClick={triggerRefresh}
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
                className={`flex items-start gap-3 ${isCurrentUser ? "flex-row-reverse" : ""
                  }`}
              >
                {showAvatar ? (
                  <div className="flex-shrink-0 relative group">
                    {(message.user.avatar?.base64Image) ? (
                      <>
                        <div className="relative w-10 h-10 rounded-full border-2 border-purple-500/30 transition-transform group-hover:scale-110 cursor-pointer overflow-hidden">
                          <Image
                            src={message.user.avatar.base64Image}
                            alt={message.user.username}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              // Fallback to initial if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                            unoptimized
                          />
                        </div>
                        {/* Hover preview of full avatar - desktop only */}
                        {message.user.avatar?.base64Image && (
                          <div className="absolute z-50 hidden sm:group-hover:block bottom-12 left-0 p-2 bg-[#0d0816] rounded-lg shadow-xl border border-purple-500/30">
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                              <Image
                                src={message.user.avatar.base64Image}
                                alt={`${message.user.username}'s avatar`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
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
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/20 ${message.user.avatar?.base64Image ? 'hidden' : ''
                      }`}>
                      {message.user.username[0].toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="w-10 flex-shrink-0" />
                )}

                <div
                  className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"
                    } max-w-[85%] sm:max-w-[70%]`}
                >
                  {showAvatar && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${isCurrentUser ? "text-purple-400" : "text-purple-300"
                        }`}>
                        {message.user.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl ${isCurrentUser
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
