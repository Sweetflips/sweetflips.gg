// src/components/Coinflip/CoinflipLanding.tsx
"use client";
import React from "react";

const CoinflipLanding: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center text-white p-4">
      <div className="w-48 h-48 md:w-64 md:h-64 mb-8 flex items-center justify-center rounded-full bg-sweetflipsPanel/50 border-2 border-primary/30">
        {/* AI Agent: The user will provide the coin flip animation to place inside this div. This is a placeholder. */}
        <span className="text-gray-400">Animation Coming Soon...</span>
      </div>
      <h1 className="text-5xl sm:text-6xl font-extrabold text-white animate-pulse-glow">
        Coinflip
      </h1>
      <p className="mt-4 text-xl sm:text-2xl text-purple-300 font-semibold">
        Coming Soon™
      </p>
      <p className="mt-2 max-w-lg text-base text-bodydark1">
        Get ready to flip for sweet rewards. Our new game is being polished and will be available right here very soon!
      </p>
    </div>
  );
};

export default CoinflipLanding;
