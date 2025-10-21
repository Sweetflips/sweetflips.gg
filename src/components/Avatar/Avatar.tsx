"use client";

import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

interface AvatarData {
  base64Image?: string | null;
  avatarId?: string;
  gender?: string;
  avatarUrl?: string;
  thumbnailUrl?: string;
}

interface AvatarProps {
  userId: number;
  size?: "small" | "medium" | "large" | "xlarge";
  showBorder?: boolean;
  showStatus?: boolean;
  onAvatarLoad?: (hasAvatar: boolean) => void;
  className?: string;
  fallbackIcon?: React.ReactNode;
  animate?: boolean;
}

const sizeClasses = {
  small: "w-10 h-10",
  medium: "w-16 h-16",
  large: "w-24 h-24",
  xlarge: "w-32 h-32"
};

const borderSizes = {
  small: "border-2",
  medium: "border-3",
  large: "border-4",
  xlarge: "border-4"
};

export default function Avatar({
  userId,
  size = "medium",
  showBorder = true,
  showStatus = false,
  onAvatarLoad,
  className = "",
  fallbackIcon,
  animate = true
}: AvatarProps) {
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuth();

  const fetchAvatar = useCallback(async () => {
    if (!userId || userId <= 0) {
      setLoading(false);
      setError(true);
      onAvatarLoad?.(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const headers: HeadersInit = {};
      if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch(`/api/avatar/${userId}`, { headers });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.avatar) {
          const avatar = data.avatar || data;
          const hasValidAvatar = !!(
            avatar.Base64Image ||
            avatar.base64Image ||
            avatar.thumbnailUrl
          );

          setAvatarData({
            base64Image: avatar.Base64Image || avatar.base64Image,
            avatarId: avatar.avatarId,
            gender: avatar.gender,
            avatarUrl: avatar.avatarUrl,
            thumbnailUrl: avatar.thumbnailUrl
          });

          onAvatarLoad?.(hasValidAvatar);
          setError(!hasValidAvatar);
        } else {
          setError(true);
          onAvatarLoad?.(false);
        }
      } else if (response.status === 404) {
        // Avatar not found - this is normal for users without avatars
        console.log(`Avatar not found for user ${userId} - this is normal`);
        setError(true);
        onAvatarLoad?.(false);
      } else {
        console.error(`Avatar API error: ${response.status} ${response.statusText}`);
        setError(true);
        onAvatarLoad?.(false);
      }
    } catch (err) {
      console.error("Error fetching avatar:", err);
      setError(true);
      onAvatarLoad?.(false);
    } finally {
      setLoading(false);
    }
  }, [userId, supabaseClient, onAvatarLoad]);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  const containerClasses = `
    relative ${sizeClasses[size]} ${className}
    ${showBorder ? `${borderSizes[size]} border-purple-500/50` : ''}
    rounded-full overflow-hidden
    bg-gradient-to-br from-purple-900/50 to-pink-900/50
  `;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-1/2 w-1/2 border-t-2 border-b-2 border-purple-400"></div>
        </div>
      );
    }

    if (error || !avatarData?.base64Image) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20">
          {fallbackIcon || (
            <svg
              className="w-1/2 h-1/2 text-purple-300/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>
      );
    }

    return (
      <Image
        src={avatarData.base64Image}
        alt="Avatar"
        fill
        className="object-cover"
        onError={() => setError(true)}
        unoptimized
      />
    );
  };

  const content = (
    <div className={containerClasses}>
      {renderContent()}

      {showStatus && !loading && (
        <div className="absolute bottom-0 right-0 w-1/4 h-1/4 rounded-full border-2 border-[#1b1324] bg-green-500"></div>
      )}

      {showBorder && !loading && !error && avatarData?.base64Image && (
        <div className="absolute inset-0 rounded-full border border-purple-400/20 pointer-events-none"></div>
      )}
    </div>
  );

  if (animate && !loading) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
