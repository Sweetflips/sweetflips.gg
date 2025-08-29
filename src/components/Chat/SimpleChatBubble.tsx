"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";
import ChatBubbleContainer from "./ChatBubbleContainer";

export default function SimpleChatBubble() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { isLoggedIn, supabaseUser, supabaseClient } = useAuth();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // Build headers - add Supabase auth if available
        const headers: HeadersInit = {};
        
        if (supabaseClient) {
          const { data: { session } } = await supabaseClient.auth.getSession();
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
          }
        }
        
        // Call unified endpoint that handles both Kick and Supabase auth
        const res = await fetch("/api/user/profile", { headers });
        
        if (res.ok) {
          const data = await res.json();
          console.log("SimpleChatBubble: Fetched user profile:", data);
          if (data.user?.id) {
            setUserId(data.user.id);
            console.log("SimpleChatBubble: Set userId to:", data.user.id);
          }
        } else {
          console.error("Failed to fetch user profile:", res.status);
        }
      } catch (error) {
        console.error("Error fetching user ID for chat:", error);
      }
    };

    fetchUserId();
  }, [supabaseClient]);

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

  const handleAuthRedirect = () => {
    router.push('/auth/signin');
  };

  // Use 0 to indicate unauthenticated user (for viewing only)
  const displayUserId = userId || 0;

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
                <h3 className="text-white font-semibold">Sweetflips Chat</h3>
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
              <ChatBubbleContainer 
                userId={displayUserId} 
                isAuthenticated={isLoggedIn && userId !== null}
                onAuthRequired={handleAuthRedirect}
              />
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