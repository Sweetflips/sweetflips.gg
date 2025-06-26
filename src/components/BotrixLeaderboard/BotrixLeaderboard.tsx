"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

type UserData = {
  id: number;
  username: string;
  points: number;
};

const BotrixLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);

  useEffect(() => {
    // ✅ Only fetch cached leaderboard from your DB
    const fetchLeaderboard = async () => {
      const res = await fetch("/api/BotrixLeaderboard");
      const data = await res.json();
      setLeaderboard(data);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="rounded-xl border border-graydark bg-[radial-gradient(at_top_center,_#350c4a_0%,_#130C1A_60%)] p-6 shadow-card">
      {/* <h2 className="mb-4 md:mb-12 text-center text-3xl font-bold text-white">Stream Leaderboard</h2> */} {/* Header moved to page.tsx */}
  
      <div className="mb-2 flex items-center justify-between px-6 text-white text-xs md:text-sm font-semibold tracking-wide">
        <div className="w-1/4">Rank</div>
        <div className="w-1/2 text-center">Username</div>
        <div className="w-1/4 text-right">Total Points</div>
      </div>
  
      {leaderboard.length > 0 ? (
        leaderboard.map((user, index) => (
          <div
            key={user.id}
            className={`relative mb-4 flex items-center justify-between rounded-2xl px-6 py-2 shadow-md border ${
              index === 0
                ? 'bg-purple-800/40 border-gold'
                : 'bg-purple-800/40 border-purple-500'
            } hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] transition-shadow`}
          >
            <div className="flex items-center gap-3 w-1/4">
              {index === 0 && (
                <Image src="/images/logo/sweet_flips_emblem_gold.png" alt="Logo" width={30} height={30} />
              )}
              {index === 1 && (
                <Image src="/images/logo/sweet_flips_emblem_silver.png" alt="Logo" width={30} height={30} />
              )}
              {index === 2 && (
                <Image src="/images/logo/sweet_flips_emblem_bronze.png" alt="Logo" width={30} height={30} />
              )}
              {index > 2 && (
                <span className="text-white font-semibold text-lg">{index + 1}</span>
              )}
            </div>
  
            <div className="w-1/2 text-white font-medium text-xs md:text-lg text-center">
              {user.username}
            </div>
  
            <div className="flex items-center justify-end gap-1 w-1/4 text-white font-semibold text-sm md:text-lg">
              <Image src="/images/logo/kick_logo.webp" alt="Kick logo" width={16} height={16} />
              <div className="w-1/2 text-white font-medium text-xs md:text-lg text-center">
                {user.points}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-sm text-gray-400">No leaderboard data yet</div>
      )}
    </div>
  );  
};

export default BotrixLeaderboard;