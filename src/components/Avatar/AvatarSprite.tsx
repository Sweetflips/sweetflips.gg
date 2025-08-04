"use client";

import React from "react";

interface AvatarSpriteProps {
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
  size?: "small" | "medium" | "large";
  className?: string;
}

const sizeMap = {
  small: "w-16 h-20",
  medium: "w-24 h-32",
  large: "w-32 h-40",
};

export default function AvatarSprite({
  skin,
  hair,
  hairColor,
  facialHair,
  top,
  jacket,
  bottom,
  shoes,
  hat,
  glasses,
  size = "medium",
  className = "",
}: AvatarSpriteProps) {
  // This is a placeholder implementation
  // In a real implementation, you would:
  // 1. Load sprite sheets for each part
  // 2. Layer them correctly (skin -> clothes -> hair -> accessories)
  // 3. Apply correct colors and positioning
  
  const skinColors: Record<string, string> = {
    pale: "#FDBCB4",
    light: "#F4C2A1",
    medium: "#D2A077",
    tan: "#B47E4F",
    brown: "#8D5524",
    dark: "#5D3A1A",
  };

  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Base body shape with skin color */}
      <div 
        className="absolute inset-0 rounded-t-full"
        style={{
          background: `linear-gradient(to bottom, ${skinColors[skin] || skinColors.light} 0%, ${skinColors[skin] || skinColors.light} 30%, transparent 30%)`,
        }}
      />
      
      {/* Hair */}
      {hair !== "bald" && (
        <div 
          className="absolute top-0 left-0 right-0 h-1/4"
          style={{
            backgroundColor: hairColor,
            borderRadius: "50% 50% 0 0",
          }}
        />
      )}
      
      {/* Placeholder for actual sprite rendering */}
      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
        Sprite
      </div>
    </div>
  );
}