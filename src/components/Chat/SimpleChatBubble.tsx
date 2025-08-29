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
    // First try to get userId from cookies
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const cookieUserId = getCookieValue('userId');
    console.log("SimpleChatBubble: Cookie userId:", cookieUserId);
    
    if (cookieUserId) {
      const parsedUserId = parseInt(cookieUserId, 10);
      if (!isNaN(parsedUserId)) {
        setUserId(parsedUserId);
        console.log("SimpleChatBubble: Set userId from cookie:", parsedUserId);
        return;
      }
    }

    // Fallback to API if no cookie
    const fetchUserId = async () => {
      if (!isLoggedIn) {
        setUserId(null);
        return;
      }

      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          console.log("SimpleChatBubble: Fetched user data:", data);
          if (data.user?.id) {
            setUserId(data.user.id);
            console.log("SimpleChatBubble: Set userId to:", data.user.id);
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

    if (!cookieUserId) {
      fetchUserId();
    }
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

  // Use the actual userId, don't fallback to 1
  const displayUserId = userId;

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
              {displayUserId ? (
                <ChatBubbleContainer userId={displayUserId} />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-400">Loading user data...</p>
                  </div>
                </div>
              )}
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