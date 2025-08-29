"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function ChatBubbleTest() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  console.log("ChatBubbleTest rendering, isOpen:", isOpen);

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
            className="fixed z-[9999] bottom-24 right-6 w-[420px] h-[650px] max-h-[85vh]"
          >
            <div className="h-full rounded-2xl shadow-2xl border border-purple-700/50 bg-[#0f0514]/95 backdrop-blur-sm overflow-hidden flex flex-col">
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
              
              {/* Chat Content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-lg mb-2">Chat Test Mode</p>
                  <p className="text-sm text-gray-400">This is a test version without authentication</p>
                </div>
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
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Open Chat (Test Mode)
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