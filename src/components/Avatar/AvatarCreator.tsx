"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarPart {
  id: string;
  name: string;
  preview: string;
}

interface AvatarCategory {
  id: string;
  name: string;
  icon: string;
  parts: AvatarPart[];
}

interface AvatarState {
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
}

const skinTones = [
  { id: "pale", color: "#FDBCB4" },
  { id: "light", color: "#F4C2A1" },
  { id: "medium", color: "#D2A077" },
  { id: "tan", color: "#B47E4F" },
  { id: "brown", color: "#8D5524" },
  { id: "dark", color: "#5D3A1A" },
];

const hairColors = [
  { id: "white", color: "#FFFFFF" },
  { id: "gray", color: "#808080" },
  { id: "blonde", color: "#FFD700" },
  { id: "red", color: "#B22222" },
  { id: "brown", color: "#8B4513" },
  { id: "darkBrown", color: "#4B2F20" },
  { id: "black", color: "#000000" },
  { id: "purple", color: "#9370DB" },
  { id: "blue", color: "#1E90FF" },
  { id: "green", color: "#228B22" },
  { id: "pink", color: "#FF69B4" },
  { id: "orange", color: "#FF8C00" },
];

const categories: AvatarCategory[] = [
  {
    id: "skin",
    name: "Skin",
    icon: "👤",
    parts: skinTones.map(tone => ({
      id: tone.id,
      name: tone.id,
      preview: tone.color,
    })),
  },
  {
    id: "hair",
    name: "Hair",
    icon: "💇",
    parts: [
      { id: "bald", name: "Bald", preview: "👴" },
      { id: "short", name: "Short", preview: "🧑" },
      { id: "medium", name: "Medium", preview: "👨" },
      { id: "long", name: "Long", preview: "👩" },
      { id: "ponytail", name: "Ponytail", preview: "👱‍♀️" },
      { id: "bun", name: "Bun", preview: "🧑‍🦱" },
      { id: "afro", name: "Afro", preview: "👨‍🦱" },
      { id: "mohawk", name: "Mohawk", preview: "🎸" },
      { id: "spiky", name: "Spiky", preview: "⚡" },
    ],
  },
  {
    id: "facialHair",
    name: "Facial hair",
    icon: "🧔",
    parts: [
      { id: "none", name: "None", preview: "👨" },
      { id: "mustache", name: "Mustache", preview: "👨" },
      { id: "beard", name: "Beard", preview: "🧔" },
      { id: "goatee", name: "Goatee", preview: "🧔" },
      { id: "fullBeard", name: "Full Beard", preview: "🧔‍♂️" },
    ],
  },
  {
    id: "top",
    name: "Top",
    icon: "👕",
    parts: [
      { id: "tshirt", name: "T-Shirt", preview: "👕" },
      { id: "shirt", name: "Shirt", preview: "👔" },
      { id: "hoodie", name: "Hoodie", preview: "🧥" },
      { id: "tank", name: "Tank Top", preview: "🎽" },
      { id: "dress", name: "Dress", preview: "👗" },
    ],
  },
  {
    id: "jacket",
    name: "Jacket",
    icon: "🧥",
    parts: [
      { id: "none", name: "None", preview: "✖️" },
      { id: "blazer", name: "Blazer", preview: "🤵" },
      { id: "leather", name: "Leather", preview: "🧥" },
      { id: "denim", name: "Denim", preview: "👖" },
      { id: "varsity", name: "Varsity", preview: "🏈" },
    ],
  },
  {
    id: "bottom",
    name: "Bottom",
    icon: "👖",
    parts: [
      { id: "jeans", name: "Jeans", preview: "👖" },
      { id: "shorts", name: "Shorts", preview: "🩳" },
      { id: "skirt", name: "Skirt", preview: "👗" },
      { id: "sweatpants", name: "Sweatpants", preview: "👖" },
      { id: "formal", name: "Formal", preview: "🤵" },
    ],
  },
  {
    id: "shoes",
    name: "Shoes",
    icon: "👟",
    parts: [
      { id: "sneakers", name: "Sneakers", preview: "👟" },
      { id: "boots", name: "Boots", preview: "🥾" },
      { id: "heels", name: "Heels", preview: "👠" },
      { id: "sandals", name: "Sandals", preview: "👡" },
      { id: "formal", name: "Formal", preview: "👞" },
    ],
  },
  {
    id: "hat",
    name: "Hat",
    icon: "🧢",
    parts: [
      { id: "none", name: "None", preview: "✖️" },
      { id: "cap", name: "Cap", preview: "🧢" },
      { id: "beanie", name: "Beanie", preview: "🎩" },
      { id: "fedora", name: "Fedora", preview: "🎩" },
      { id: "cowboy", name: "Cowboy", preview: "🤠" },
    ],
  },
  {
    id: "glasses",
    name: "Glasses",
    icon: "👓",
    parts: [
      { id: "none", name: "None", preview: "✖️" },
      { id: "regular", name: "Regular", preview: "👓" },
      { id: "sunglasses", name: "Sunglasses", preview: "🕶️" },
      { id: "monocle", name: "Monocle", preview: "🧐" },
      { id: "goggles", name: "Goggles", preview: "🥽" },
    ],
  },
  {
    id: "other",
    name: "Other",
    icon: "✨",
    parts: [
      { id: "none", name: "None", preview: "✖️" },
      { id: "necklace", name: "Necklace", preview: "📿" },
      { id: "earrings", name: "Earrings", preview: "💎" },
      { id: "watch", name: "Watch", preview: "⌚" },
      { id: "backpack", name: "Backpack", preview: "🎒" },
    ],
  },
];

interface AvatarCreatorProps {
  onClose?: () => void;
}

export default function AvatarCreator({ onClose }: AvatarCreatorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("skin");
  const [avatarState, setAvatarState] = useState<AvatarState>({
    skin: "light",
    hair: "short",
    hairColor: "#8B4513",
    top: "tshirt",
    bottom: "jeans",
    shoes: "sneakers",
  });
  const [selectedHairColor, setSelectedHairColor] = useState("#8B4513");

  const handlePartSelect = (categoryId: string, partId: string) => {
    setAvatarState(prev => ({
      ...prev,
      [categoryId]: partId === "none" ? undefined : partId,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...avatarState,
          hairColor: selectedHairColor,
        }),
      });

      if (response.ok) {
        // Handle success
        console.log("Avatar saved successfully");
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-[90vw] max-w-7xl h-[90vh] flex flex-col"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl" />
        
        <div className="relative bg-[#1b1324] border border-purple-700/50 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col h-full overflow-hidden">
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
          
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-6 border-b border-purple-700/30">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Avatar Creator
              </h2>
              <p className="text-gray-400 mt-1">Design your unique pixel character</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 bg-[#2a1b3d] hover:bg-[#3a2b4d] rounded-xl text-gray-400 hover:text-white transition-all border border-purple-700/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <div className="relative z-10 flex flex-1 overflow-hidden">
            {/* Category sidebar */}
            <div className="w-80 bg-[#0d0816] border-r border-purple-700/30 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Categories</h3>
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-4 p-4 mb-3 rounded-xl transition-all ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                      : "bg-[#2a1b3d]/50 text-gray-300 hover:bg-[#2a1b3d] border border-purple-700/30"
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                  {selectedCategory === category.id && (
                    <motion.div 
                      layoutId="activeCategory"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Parts selection */}
            <div className="flex-1 p-8 overflow-y-auto bg-[#1b1324]/50">
              {selectedCategory === "hair" && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
                    Hair Color
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {hairColors.map((color) => (
                      <motion.button
                        key={color.id}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedHairColor(color.color)}
                        className={`relative w-14 h-14 rounded-full border-4 transition-all ${
                          selectedHairColor === color.color
                            ? "border-purple-400 shadow-lg shadow-purple-500/50"
                            : "border-purple-700/50"
                        }`}
                        style={{ backgroundColor: color.color }}
                      >
                        {selectedHairColor === color.color && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 rounded-full border-2 border-white"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {categories
                  .find((cat) => cat.id === selectedCategory)
                  ?.parts.map((part) => (
                    <motion.button
                      key={part.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePartSelect(selectedCategory, part.id)}
                      className={`relative aspect-square rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all ${
                        avatarState[selectedCategory as keyof AvatarState] === part.id
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                          : "bg-[#2a1b3d]/50 text-gray-300 hover:bg-[#2a1b3d] border border-purple-700/30"
                      }`}
                    >
                      {avatarState[selectedCategory as keyof AvatarState] === part.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl animate-pulse" />
                      )}
                      
                      <div className="relative z-10">
                        {selectedCategory === "skin" ? (
                          <div
                            className="w-20 h-20 rounded-full border-4 border-purple-700/50"
                            style={{ backgroundColor: part.preview }}
                          />
                        ) : (
                          <span className="text-5xl">{part.preview}</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold relative z-10">{part.name}</span>
                    </motion.button>
                  ))}
              </div>
            </div>

            {/* Avatar preview */}
            <div className="w-96 bg-[#0d0816] border-l border-purple-700/30 p-8 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8">
                Preview
              </h3>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-[#2a1b3d] rounded-2xl p-8 border border-purple-700/50">
                  <div className="w-48 h-64 bg-[#1b1324] rounded-xl flex items-center justify-center border border-purple-700/30">
                    <span className="text-gray-500">Avatar Preview</span>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-full">
                      <span className="w-2 h-2 bg-[#53FC18] rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                      <span className="text-[#53FC18] text-sm font-medium">Online</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-white">Your Avatar</h3>
                    <p className="text-sm text-gray-400 mt-1">Ready for action!</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Your avatar will be visible in chat and games
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="relative z-10 flex items-center justify-between p-6 border-t border-purple-700/30">
            <div className="text-sm text-gray-400">
              <span className="text-purple-400">Tip:</span> Mix and match to create your unique style!
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-3 bg-[#2a1b3d] hover:bg-[#3a2b4d] text-gray-300 rounded-xl font-medium transition-all border border-purple-700/30">
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
              >
                Save Avatar
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}