"use client";

import React from "react";

interface PixelAvatarProps {
  skin: string;
  hair: string;
  hairColor: string;
  facialHair?: string;
  top: string;
  topColor?: string;
  jacket?: string;
  bottom: string;
  bottomColor?: string;
  shoes: string;
  hat?: string;
  glasses?: string;
  size?: number;
  className?: string;
}

export default function PixelAvatar({
  skin,
  hair,
  hairColor,
  facialHair,
  top,
  topColor = "#FF0000",
  jacket,
  bottom,
  bottomColor = "#0000FF",
  shoes,
  hat,
  glasses,
  size = 64,
  className = "",
}: PixelAvatarProps) {
  const pixelSize = size / 16; // 16x16 grid

  const skinColors: Record<string, string> = {
    pale: "#FDBCB4",
    light: "#F4C2A1",
    medium: "#D2A077",
    tan: "#B47E4F",
    brown: "#8D5524",
    dark: "#5D3A1A",
  };

  const skinColor = skinColors[skin] || skinColors.light;

  // Simple pixel art representation using divs
  // This is a basic implementation - in production, you'd use sprite sheets
  const renderPixel = (x: number, y: number, color: string) => (
    <div
      key={`${x}-${y}`}
      className="absolute"
      style={{
        left: x * pixelSize,
        top: y * pixelSize,
        width: pixelSize,
        height: pixelSize,
        backgroundColor: color,
      }}
    />
  );

  const pixels: JSX.Element[] = [];

  // Head (rows 2-5)
  for (let y = 2; y <= 5; y++) {
    for (let x = 5; x <= 10; x++) {
      pixels.push(renderPixel(x, y, skinColor));
    }
  }

  // Hair (rows 0-2)
  if (hair !== "bald") {
    for (let y = 0; y <= 2; y++) {
      for (let x = 4; x <= 11; x++) {
        if (
          (y === 0 && x >= 5 && x <= 10) ||
          (y === 1 && x >= 4 && x <= 11) ||
          (y === 2 && (x === 4 || x === 11))
        ) {
          pixels.push(renderPixel(x, y, hairColor));
        }
      }
    }
  }

  // Eyes
  pixels.push(renderPixel(6, 3, "#000000"));
  pixels.push(renderPixel(9, 3, "#000000"));

  // Facial hair
  if (facialHair && facialHair !== "none") {
    // Simple mustache
    if (facialHair === "mustache") {
      pixels.push(renderPixel(6, 4, "#4B4B4B"));
      pixels.push(renderPixel(7, 4, "#4B4B4B"));
      pixels.push(renderPixel(8, 4, "#4B4B4B"));
      pixels.push(renderPixel(9, 4, "#4B4B4B"));
    }
  }

  // Body/Top (rows 6-9)
  for (let y = 6; y <= 9; y++) {
    for (let x = 4; x <= 11; x++) {
      pixels.push(renderPixel(x, y, topColor));
    }
  }

  // Arms
  for (let y = 6; y <= 8; y++) {
    pixels.push(renderPixel(3, y, skinColor));
    pixels.push(renderPixel(12, y, skinColor));
  }

  // Bottom (rows 10-13)
  for (let y = 10; y <= 13; y++) {
    for (let x = 5; x <= 10; x++) {
      pixels.push(renderPixel(x, y, bottomColor));
    }
  }

  // Shoes (rows 14-15)
  for (let y = 14; y <= 15; y++) {
    for (let x = 5; x <= 7; x++) {
      pixels.push(renderPixel(x, y, "#333333"));
    }
    for (let x = 8; x <= 10; x++) {
      pixels.push(renderPixel(x, y, "#333333"));
    }
  }

  // Glasses
  if (glasses && glasses !== "none") {
    if (glasses === "regular") {
      pixels.push(renderPixel(5, 3, "#333333"));
      pixels.push(renderPixel(6, 3, "#87CEEB"));
      pixels.push(renderPixel(7, 3, "#333333"));
      pixels.push(renderPixel(8, 3, "#333333"));
      pixels.push(renderPixel(9, 3, "#87CEEB"));
      pixels.push(renderPixel(10, 3, "#333333"));
    }
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
      }}
    >
      {pixels}
    </div>
  );
}