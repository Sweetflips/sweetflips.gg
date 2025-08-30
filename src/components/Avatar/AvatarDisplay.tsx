"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Avatar from "./Avatar";

interface AvatarDisplayProps {
  userId: number;
  username: string;
  onEditAvatar?: () => void;
  showEditButton?: boolean;
}

export default function AvatarDisplay({
  userId,
  username,
  onEditAvatar,
  showEditButton = true
}: AvatarDisplayProps) {
  const [hasAvatar, setHasAvatar] = useState<boolean | null>(null);
  const [hovering, setHovering] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-4"
    >
      <div 
        className="relative group"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          
          <Avatar
            userId={userId}
            size="xlarge"
            showBorder={true}
            onAvatarLoad={setHasAvatar}
            className="relative z-10 shadow-2xl"
          />
          
          {showEditButton && hasAvatar && hovering && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={onEditAvatar}
              className="absolute bottom-2 right-2 z-20 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg transition-colors"
              title="Edit Avatar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </motion.button>
          )}
        </div>
        
        {!hasAvatar && showEditButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onEditAvatar}
            className="absolute inset-0 z-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="text-center">
              <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-white text-sm font-medium">Create Avatar</span>
            </div>
          </motion.button>
        )}
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          {username}
        </h3>
        {hasAvatar === false && (
          <p className="text-xs text-gray-400 mt-1">No avatar yet</p>
        )}
      </div>
    </motion.div>
  );
}