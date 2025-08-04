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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90vw] max-w-6xl h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Avatar</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Category sidebar */}
          <div className="w-80 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center gap-4 p-4 mb-2 rounded-xl transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Parts selection */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedCategory === "hair" && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Hair Color</h3>
                <div className="flex flex-wrap gap-3">
                  {hairColors.map((color) => (
                    <motion.button
                      key={color.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedHairColor(color.color)}
                      className={`w-12 h-12 rounded-full border-4 ${
                        selectedHairColor === color.color
                          ? "border-blue-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      style={{ backgroundColor: color.color }}
                    />
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
                    className={`aspect-square rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-colors ${
                      avatarState[selectedCategory as keyof AvatarState] === part.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {selectedCategory === "skin" ? (
                      <div
                        className="w-16 h-16 rounded-full"
                        style={{ backgroundColor: part.preview }}
                      />
                    ) : (
                      <span className="text-4xl">{part.preview}</span>
                    )}
                    <span className="text-sm font-medium">{part.name}</span>
                  </motion.button>
                ))}
            </div>
          </div>

          {/* Avatar preview */}
          <div className="w-96 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-6 flex flex-col items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="w-48 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">Avatar Preview</span>
              </div>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Online
                </span>
                <h3 className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">Username</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}