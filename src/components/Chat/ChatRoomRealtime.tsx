"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  currentUserId: number;
  onOpenSidebar?: () => void;
}

export default function ChatRoomRealtime({ 
  roomId, 
  roomName, 
  currentUserId, 
  onOpenSidebar 
}: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousMessageCountRef = useRef(0);
  
  // Use the realtime hook
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    connectionStatus,
    retry,
  } = useRealtimeChat({
    roomId,
    onMessageReceived: (message) => {
      // Auto-scroll on new message if user is near bottom
      const container = messagesEndRef.current?.parentElement;
      if (container) {
        const isNearBottom = 
          container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          scrollToBottom();
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && previousMessageCountRef.current === 0) {
      scrollToBottom();
    }
    previousMessageCountRef.current = messages.length;
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage;
    setNewMessage("");
    setIsSending(true);

    try {
      await sendMessage(messageContent);
      inputRef.current?.focus();
      // Scroll after a brief delay to ensure DOM update
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      // Restore message on error
      setNewMessage(messageContent);
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
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

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-[#53FC18]';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 mb-2">Failed to load messages</p>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <button
            onClick={retry}
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
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </p>
            </div>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}></div>
            <span className="text-xs sm:text-sm text-gray-400">{getConnectionStatusText()}</span>
            {connectionStatus === 'error' && (
              <button
                onClick={retry}
                className="ml-2 text-xs text-purple-400 hover:text-purple-300"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No messages yet</p>
              <p className="text-sm mt-2">Be the first to send a message!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isCurrentUser = message.userId === currentUserId;
              const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;
              const showTime = showAvatar || 
                (index > 0 && new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 60000);

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                >
                  {showAvatar ? (
                    <div className="flex-shrink-0 relative group">
                      {message.user.avatar?.base64Image ? (
                        <>
                          <img
                            src={message.user.avatar.base64Image}
                            alt={message.user.username}
                            className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30 transition-transform group-hover:scale-110 cursor-pointer"
                            onError={(e) => {
                              // Fallback to initial if image fails
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          
                          {/* Avatar preview on hover - desktop only */}
                          <div className="absolute z-50 hidden sm:group-hover:block bottom-12 left-0 p-2 bg-[#0d0816] rounded-lg shadow-xl border border-purple-500/30">
                            <img
                              src={message.user.avatar.base64Image}
                              alt={`${message.user.username}'s avatar`}
                              className="w-32 h-32 rounded-lg object-cover"
                            />
                            <div className="mt-2 text-xs text-center text-gray-400">
                              {message.user.username}
                            </div>
                          </div>
                        </>
                      ) : null}
                      
                      {/* Fallback avatar */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/20 ${
                        message.user.avatar?.base64Image ? 'hidden' : ''
                      }`}>
                        {message.user.username[0]?.toUpperCase() || '?'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 flex-shrink-0" />
                  )}

                  <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[70%]`}>
                    {showAvatar && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${
                          isCurrentUser ? "text-purple-400" : "text-purple-300"
                        }`}>
                          {message.user.username}
                        </span>
                        {showTime && (
                          <span className="text-xs text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                        )}
                      </div>
                    )}

                    <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                        : "bg-[#2a1b3d] text-gray-100 border border-purple-700/30"
                    }`}>
                      <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                      {message.editedAt && (
                        <p className="text-xs opacity-60 mt-1">(edited)</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-6 border-t border-purple-700/30 bg-[#0d0816]/50 backdrop-blur-sm">
        <div className="flex gap-2 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={connectionStatus === 'connected' ? "Type a message..." : "Connecting..."}
            disabled={connectionStatus !== 'connected' || isSending}
            className="flex-1 px-3 sm:px-5 py-2.5 sm:py-3 bg-[#2a1b3d] border border-purple-700/50 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim() || connectionStatus !== 'connected' || isSending}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg sm:rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}