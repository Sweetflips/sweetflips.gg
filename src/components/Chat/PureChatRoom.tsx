"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabaseRealtimeChat } from "@/hooks/useSupabaseRealtimeChat";

interface PureChatRoomProps {
  roomId: string;
  roomName: string;
  currentUserId: number;
  onOpenSidebar?: () => void;
}

export default function PureChatRoom({ 
  roomId, 
  roomName, 
  currentUserId, 
  onOpenSidebar 
}: PureChatRoomProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    connectionStatus,
    refetch,
  } = useSupabaseRealtimeChat({ roomId });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage;
    setNewMessage("");
    setIsSending(true);

    try {
      await sendMessage(messageContent, currentUserId);
      inputRef.current?.focus();
    } catch (error) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 mb-2">Connection Error</p>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-5 border-b border-purple-700/30 bg-[#0d0816]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
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
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${
              connectionStatus === 'connected' ? 'bg-[#53FC18] animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            } rounded-full`}></div>
            <span className="text-xs sm:text-sm text-gray-400">
              {connectionStatus === 'connected' ? 'Live' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
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

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                >
                  {showAvatar ? (
                    <div className="flex-shrink-0">
                      {message.user?.avatar?.base64Image ? (
                        <img
                          src={message.user.avatar.base64Image}
                          alt={message.user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {message.user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-10 flex-shrink-0" />
                  )}

                  <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[70%]`}>
                    {showAvatar && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${
                          isCurrentUser ? "text-purple-400" : "text-purple-300"
                        }`}>
                          {message.user?.username || `User ${message.userId}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    )}

                    <div className={`px-4 py-3 rounded-2xl ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
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

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-6 border-t border-purple-700/30 bg-[#0d0816]/50 backdrop-blur-sm">
        <div className="flex gap-2 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={connectionStatus !== 'connected' || isSending}
            className="flex-1 px-5 py-3 bg-[#2a1b3d] border border-purple-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim() || connectionStatus !== 'connected' || isSending}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}