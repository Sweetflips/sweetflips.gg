"use client";

import React, { useState, useEffect } from "react";
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";
import ChatBubbleContainer from "./ChatBubbleContainer";

export default function SimpleChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { isLoggedIn, supabaseUser } = useAuth();

  useEffect(() => {
    const fetchUserId = async () => {
      if (!isLoggedIn) {
        setUserId(null);
        return;
      }

      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.id) {
            setUserId(data.user.id);
            return;
          }
        }

        if (supabaseUser) {
          const sessionRes = await fetch("/api/auth/session");
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData.user?.id) {
              setUserId(sessionData.user.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user ID for chat:", error);
      }
    };

    fetchUserId();
  }, [isLoggedIn, supabaseUser]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // For testing: temporarily set a default user ID if not logged in
  const displayUserId = userId || 1; // Use ID 1 as fallback for testing

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-[9999] ${
          isMobile 
            ? "inset-0" 
            : "bottom-24 right-6 w-[420px] h-[650px] max-h-[85vh]"
        }`}>
          <div className={`h-full ${
            isMobile 
              ? "" 
              : "rounded-2xl shadow-2xl border border-purple-700/50"
          } bg-[#0f0514]/95 backdrop-blur-sm overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 flex items-center justify-between border-b border-purple-700/30">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <h3 className="text-white font-semibold">Community Chat</h3>
              </div>
              <button
                onClick={handleToggle}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white/80" />
              </button>
            </div>
            
            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <ChatBubbleContainer userId={displayUserId} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Bubble Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-200 group"
        >
          <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Open Chat (Simple Test)
          </div>
        </button>
      )}
    </>
  );
}