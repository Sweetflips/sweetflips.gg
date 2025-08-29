"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatBubbleContainer from "./ChatBubbleContainer";
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface ChatBubbleProps {
  userId: number;
}

export default function ChatBubble({ userId }: ChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnreadMessages(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed z-[9999] ${
              isMobile 
                ? "inset-0" 
                : "bottom-24 right-6 w-[420px] h-[650px] max-h-[85vh]"
            }`}
          >
            <div className={`${
              isMobile 
                ? "h-full" 
                : "h-full rounded-2xl shadow-2xl border border-purple-700/50"
            } bg-[#0f0514]/95 backdrop-blur-sm overflow-hidden flex flex-col`}>
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 flex items-center justify-between border-b border-purple-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="text-white font-semibold">Community Chat</h3>
                </div>
                <button
                  onClick={toggleChat}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white/80" />
                </button>
              </div>
              
              {/* Chat Container */}
              <div className="flex-1 overflow-hidden">
                <ChatBubbleContainer userId={userId} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bubble Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-[9999] ${
          isOpen ? "hidden" : "flex"
        } items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-200 group`}
      >
        <div className="relative">
          <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
          
          {/* Unread indicator */}
          {hasUnreadMessages && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            >
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
            </motion.div>
          )}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Open Chat
        </div>
      </motion.button>

      {/* Pulse animation for attention */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 w-14 h-14 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
          />
        </div>
      )}
    </>
  );
}