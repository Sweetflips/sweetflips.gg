"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabaseRealtimeChat } from "@/hooks/useSupabaseRealtimeChat";

interface PureChatRoomProps {
  roomId: string;
  roomName: string;
  currentUserId: number;
  onOpenSidebar?: () => void;
  hideRoomHeader?: boolean;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

export default function PureChatRoom({ 
  roomId, 
  roomName, 
  currentUserId, 
  onOpenSidebar,
  hideRoomHeader = false,
  isAuthenticated = true,
  onAuthRequired
}: PureChatRoomProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [tooltipUser, setTooltipUser] = useState<{ id: number; username: string; avatar?: any } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; adjustX?: string; adjustY?: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Set mounted to true when component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);


  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.avatar-container') && !target.closest('.avatar-tooltip')) {
        setTooltipUser(null);
        setTooltipPosition(null);
      }
    };

    if (tooltipUser && isMobile) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [tooltipUser, isMobile]);

  const checkUserAvatar = async () => {
    try {
      const response = await fetch(`/api/chat/user-info?userId=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        return !!(data.user?.avatar?.base64Image || data.user?.avatar?.avatarId);
      }
    } catch (error) {
      console.error('Failed to check avatar:', error);
    }
    return false;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not authenticated, redirect to signin
    if (!isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }
    
    if (!newMessage.trim() || isSending) return;

    // Check if user has avatar
    const hasAvatar = await checkUserAvatar();
    if (!hasAvatar) {
      setShowAvatarPrompt(true);
      return;
    }

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

  const calculateTooltipPosition = (rect: DOMRect) => {
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    const tooltipWidth = 250; // Approximate tooltip width
    const tooltipHeight = 100; // Approximate tooltip height
    const padding = 10; // Padding from screen edges
    
    let x = rect.left + rect.width / 2 + scrollX;
    let y = rect.top - 10 + scrollY;
    let adjustX = 'translate(-50%, 0)';
    let adjustY = 'translate(0, -100%)';
    
    // Check horizontal boundaries
    if (x - tooltipWidth / 2 < padding) {
      // Too far left, align to left edge
      x = rect.left + scrollX;
      adjustX = 'translate(0, 0)';
    } else if (x + tooltipWidth / 2 > window.innerWidth - padding) {
      // Too far right, align to right edge
      x = rect.right + scrollX;
      adjustX = 'translate(-100%, 0)';
    }
    
    // Check vertical boundaries
    if (y - tooltipHeight < padding + scrollY) {
      // Too high, show below avatar instead
      y = rect.bottom + 10 + scrollY;
      adjustY = 'translate(0, 0)';
    }
    
    return { x, y, adjustX, adjustY };
  };

  const handleAvatarHover = (user: any, event: React.MouseEvent) => {
    if (isMobile) return; // On mobile, use click instead
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const position = calculateTooltipPosition(rect);
    
    setTooltipPosition(position);
    setTooltipUser(user);

    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  };

  const handleAvatarLeave = () => {
    if (isMobile) return;
    
    // Add a small delay before hiding to prevent flicker
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipUser(null);
      setTooltipPosition(null);
    }, 100);
  };

  const handleAvatarClick = (user: any, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!isMobile) return; // On desktop, use hover instead
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const position = calculateTooltipPosition(rect);
    
    // Toggle tooltip
    if (tooltipUser?.id === user.id) {
      setTooltipUser(null);
      setTooltipPosition(null);
    } else {
      setTooltipPosition(position);
      setTooltipUser(user);
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
      {!hideRoomHeader && (
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
      )}

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
                    <div 
                      className="flex-shrink-0 avatar-container cursor-pointer"
                      onMouseEnter={(e) => handleAvatarHover(message.user, e)}
                      onMouseLeave={handleAvatarLeave}
                      onClick={(e) => handleAvatarClick(message.user, e)}
                    >
                      {message.user?.avatar?.base64Image ? (
                        <img
                          src={message.user.avatar.base64Image}
                          alt={message.user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30 hover:border-purple-400 transition-colors"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold hover:from-purple-500 hover:to-pink-600 transition-all">
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
            onClick={() => {
              if (!isAuthenticated && onAuthRequired) {
                onAuthRequired();
              }
            }}
            placeholder={isAuthenticated ? "Type a message..." : "Sign in to send messages..."}
            disabled={connectionStatus !== 'connected' || isSending || !isAuthenticated}
            className="flex-1 px-5 py-3 bg-[#2a1b3d] border border-purple-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 cursor-pointer disabled:cursor-pointer"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={(isAuthenticated && !newMessage.trim()) || (isAuthenticated && connectionStatus !== 'connected') || isSending}
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

      {/* Avatar Tooltip - Rendered with Portal */}
      {mounted && createPortal(
        <AnimatePresence mode="wait">
          {tooltipUser && tooltipPosition && (
            <motion.div
              key="avatar-tooltip"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="avatar-tooltip fixed pointer-events-none"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: `${tooltipPosition.adjustX || 'translate(-50%, 0)'} ${tooltipPosition.adjustY || 'translate(0, -100%)'}`,
                zIndex: 99999,
              }}
            >
            <div className="bg-[#0d0816] border border-purple-500/50 rounded-xl p-3 shadow-2xl mb-2">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {tooltipUser.avatar?.base64Image ? (
                    <img
                      src={tooltipUser.avatar.base64Image}
                      alt={tooltipUser.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                      {tooltipUser.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                
                {/* Username */}
                <div className="pr-2">
                  <p className="text-white font-semibold text-base">
                    {tooltipUser.username || `User ${tooltipUser.id}`}
                  </p>
                  <p className="text-purple-400 text-xs">
                    ID: {tooltipUser.id}
                  </p>
                </div>
              </div>
              
              {/* Arrow pointing down or up based on position */}
              {tooltipPosition.adjustY === 'translate(0, 0)' ? (
                // Arrow pointing up (tooltip is below avatar)
                <div className="absolute left-1/2 -top-2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#0d0816]"></div>
                </div>
              ) : (
                // Arrow pointing down (tooltip is above avatar)
                <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#0d0816]"></div>
                </div>
              )}
            </div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Avatar Setup Prompt - Rendered with Portal */}
      {mounted && showAvatarPrompt && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
          onClick={() => setShowAvatarPrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-[#0d0816] border border-purple-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Avatar Icon */}
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Set Up Your Avatar</h3>
              <p className="text-gray-400 mb-6">
                You need an avatar to send messages in the chat. Create your unique avatar to start chatting!
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    window.location.href = '/webgl/index.html';
                    setShowAvatarPrompt(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
                >
                  Create Avatar
                </button>
                <button
                  onClick={() => setShowAvatarPrompt(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </div>
  );
}