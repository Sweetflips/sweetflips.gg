"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PixelAvatar from "../Avatar/PixelAvatar";

interface Message {
  id: string;
  content: string;
  userId: number;
  user: {
    id: number;
    username: string;
    avatar?: {
      skin: string;
      hair: string;
      hairColor: string;
      facialHair?: string;
      top: string;
      jacket?: string;
      bottom: string;
      shoes: string;
      hat?: string;
      glasses?: string;
    };
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
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    }
  }, [roomId]);

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
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {roomName}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {messages.length} messages
        </p>
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
                  <div className="flex-shrink-0">
                    {message.user.avatar ? (
                      <PixelAvatar
                        {...message.user.avatar}
                        size={40}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {message.user.username[0].toUpperCase()}
                      </div>
                    )}
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
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {message.user.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
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
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full font-medium transition-colors disabled:cursor-not-allowed"
          >
            Send
          </motion.button>
        </div>
      </form>
    </div>
  );
}