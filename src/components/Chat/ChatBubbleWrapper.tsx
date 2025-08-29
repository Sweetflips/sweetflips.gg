"use client";

import React, { useEffect, useState } from "react";
import ChatBubble from "./ChatBubble";
import { useAuth } from "@/contexts/AuthContext";

export default function ChatBubbleWrapper() {
  const { isLoggedIn, supabaseUser } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  
  console.log("ChatBubbleWrapper - isLoggedIn:", isLoggedIn, "supabaseUser:", supabaseUser);

  useEffect(() => {
    const fetchUserId = async () => {
      console.log("fetchUserId - isLoggedIn:", isLoggedIn);
      if (!isLoggedIn) {
        setUserId(null);
        return;
      }

      try {
        // Try to get user from API first
        const res = await fetch("/api/user");
        console.log("API /api/user response status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("API user data:", data);
          if (data.user?.id) {
            setUserId(data.user.id);
            console.log("Set userId to:", data.user.id);
            return;
          }
        }

        // If API failed but we have Supabase user, get their database ID
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

  // Only show chat bubble if user is logged in and we have their ID
  if (!isLoggedIn || !userId) {
    return null;
  }

  return <ChatBubble userId={userId} />;
}