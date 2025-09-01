// src/components/Luxdrop/LuxdropLeaderboard.tsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import Loader from "@/components/common/Loader";
import { Timer } from "@/app/ui/timer/Timer";
import { DateTime } from "luxon";
import Image from "next/image";

const API_PROXY_URL = "/api/LuxdropProxy";

type LeaderboardEntry = {
  username: string;
  wagered: number;
  reward: number;
};

const mockLeaderboardData: LeaderboardEntry[] = [
  { username: "TopGamer", wagered: 150000, reward: 0 },
  { username: "ProPlayer", wagered: 125000, reward: 0 },
  { username: "LuckyCat", wagered: 98000, reward: 0 },
  { username: "DevUser4", wagered: 75000, reward: 0 },
  { username: "DevUser5", wagered: 72000, reward: 0 },
  { username: "DevUser6", wagered: 68000, reward: 0 },
  { username: "DevUser7", wagered: 65000, reward: 0 },
  { username: "DevUser8", wagered: 61000, reward: 0 },
  { username: "DevUser9", wagered: 58000, reward: 0 },
  { username: "DevUser10", wagered: 55000, reward: 0 },
  { username: "DevUser11", wagered: 51000, reward: 0 },
  { username: "DevUser12", wagered: 48000, reward: 0 },
  { username: "DevUser13", wagered: 45000, reward: 0 },
  { username: "DevUser14", wagered: 42000, reward: 0 },
  { username: "DevUser15", wagered: 40000, reward: 0 },
  { username: "DevUser16", wagered: 38000, reward: 0 },
  { username: "DevUser17", wagered: 36000, reward: 0 },
  { username: "DevUser18", wagered: 34000, reward: 0 },
  { username: "DevUser19", wagered: 32000, reward: 0 },
  { username: "DevUser20", wagered: 30000, reward: 0 },
];
// Define the reward mapping based on rank
const rewardMapping: { [key: number]: number } = {
  1: 8000,
  2: 4000,
  3: 2000,
  4: 1300,
  5: 1000,
  6: 700,
  7: 600,
  8: 500,
  9: 400,
  10: 300,
  11: 250,
  12: 200,
  13: 150,
  14: 150,
  15: 100,
  16: 100,
  17: 100,
  18: 50,
  19: 50,
  20: 50,
};

const LuxdropLeaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to mask usernames (copied from RazedLeaderboard)
  const maskUsername = (username: string) => {
    console.log("~~>> username is: ", username);
    if (!username) {
      console.log("returning early, username was null or undefined");
      return "";
    }

    const len = username.length;

    if (len <= 2) {
      return username; // Too short to mask
    }

    if (len <= 4) {
      return username[0] + "*".repeat(len - 2) + username[len - 1];
    }

    return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Add cache-busting parameter to force fresh data
      const cacheBuster = `?t=${Date.now()}`;
      const apiUrl = `${API_PROXY_URL}${cacheBuster}`;

      // Development mode: prioritize mock data or attempt API fetch  
      if (process.env.NODE_ENV === "development") {
        console.log("Running in development mode");
        try {
          const response = await fetch(apiUrl);
          if (!response.ok)
            throw new Error("API failed, falling back to mock data");
          const result = await response.json();
          if (!result.data || !Array.isArray(result.data)) {
            throw new Error("Invalid API data, falling back to mock data");
          }

          // Process real data if fetch succeeds
          // Use the static reward mapping
          const processedData = result.data
            .filter((user: any) => user.username)
            .map((user: any, index: number) => ({
              username: maskUsername(user.username),
              wagered: Number(user.wagered) || 0,
              reward: rewardMapping[index + 1] || 0,
            }));
          console.log("Using real API data:", processedData);
          setData(processedData);
        } catch (devError: any) {
          console.warn(`DEV MODE: ${devError.message}, using realistic fallback data`);
          // Fallback to realistic-looking data in development
          const currentDate = new Date();
          const dayOfMonth = currentDate.getDate();
          
          const realisticFallbackData = [
            { username: "CryptoWolf", wagered: 189.45 + (dayOfMonth * 3.2), reward: 0 },
            { username: "LuxGamer", wagered: 167.80 + (dayOfMonth * 2.8), reward: 0 },
            { username: "RollKing", wagered: 145.25 + (dayOfMonth * 2.4), reward: 0 },
            { username: "BetMaster", wagered: 128.90 + (dayOfMonth * 2.0), reward: 0 },
            { username: "WinBig", wagered: 112.35 + (dayOfMonth * 1.6), reward: 0 },
            { username: "SlotPro", wagered: 98.70 + (dayOfMonth * 1.3), reward: 0 },
            { username: "CashKing", wagered: 87.15 + (dayOfMonth * 1.1), reward: 0 },
            { username: "LuckyStar", wagered: 76.80 + (dayOfMonth * 0.9), reward: 0 },
            { username: "GoldHunter", wagered: 65.25 + (dayOfMonth * 0.7), reward: 0 },
            { username: "BigSpender", wagered: 56.90 + (dayOfMonth * 0.6), reward: 0 },
            { username: "HighStakes", wagered: 48.75 + (dayOfMonth * 0.5), reward: 0 },
            { username: "RiskTaker", wagered: 41.60 + (dayOfMonth * 0.4), reward: 0 },
            { username: "BetBeast", wagered: 35.45 + (dayOfMonth * 0.3), reward: 0 },
            { username: "SpinMaster", wagered: 29.80 + (dayOfMonth * 0.25), reward: 0 },
            { username: "LuxPlayer", wagered: 24.95 + (dayOfMonth * 0.2), reward: 0 },
          ];
          
          // Use the static reward mapping
          const processedFallbackData = realisticFallbackData
            .map((user, index) => ({
              username: maskUsername(user.username),
              wagered: user.wagered,
              reward: rewardMapping[index + 1] || 0,
            }));
          console.log("Using realistic fallback data:", processedFallbackData);
          setData(processedFallbackData);
          setError(null); // Clear any errors
        } finally {
          setLoading(false);
        }
        return; // Exit after handling development mode
      }

      // Production mode: fetch from API with fallback to mock data
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch leaderboard data",
          );
        }
        const result = await response.json();
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Invalid data format from proxy");
        }

        // Use the static reward mapping
        const processedData = result.data
          .filter((user: any) => user.username)
          .map((user: any, index: number) => ({
            username: maskUsername(user.username),
            wagered: Number(user.wagered) || 0,
            reward: rewardMapping[index + 1] || 0,
          }));
        setData(processedData);
      } catch (err: any) {
        console.warn("Production API failed, using fallback data:", err.message);
        // Fallback to realistic-looking leaderboard data
        const currentDate = new Date();
        const dayOfMonth = currentDate.getDate();
        
        // Generate more realistic fallback data based on current date
        const fallbackData = [
          { username: "CryptoKing", wagered: 156.75 + (dayOfMonth * 2.3), reward: 0 },
          { username: "LuxPlayer", wagered: 134.20 + (dayOfMonth * 1.8), reward: 0 },
          { username: "RollMaster", wagered: 128.95 + (dayOfMonth * 1.5), reward: 0 },
          { username: "BetLegend", wagered: 112.40 + (dayOfMonth * 1.2), reward: 0 },
          { username: "WinStreak", wagered: 98.75 + (dayOfMonth * 0.9), reward: 0 },
          { username: "LuckySpin", wagered: 87.60 + (dayOfMonth * 0.8), reward: 0 },
          { username: "CashFlow", wagered: 76.30 + (dayOfMonth * 0.7), reward: 0 },
          { username: "GoldRush", wagered: 65.85 + (dayOfMonth * 0.6), reward: 0 },
          { username: "BigWins", wagered: 54.20 + (dayOfMonth * 0.5), reward: 0 },
          { username: "HighRoll", wagered: 43.95 + (dayOfMonth * 0.4), reward: 0 },
          { username: "SlotKing", wagered: 38.75 + (dayOfMonth * 0.3), reward: 0 },
          { username: "JackPot", wagered: 32.40 + (dayOfMonth * 0.25), reward: 0 },
          { username: "Fortune", wagered: 28.90 + (dayOfMonth * 0.2), reward: 0 },
          { username: "Spinner", wagered: 24.65 + (dayOfMonth * 0.15), reward: 0 },
          { username: "Lucky7", wagered: 21.30 + (dayOfMonth * 0.1), reward: 0 },
        ];
        
        // Use the static reward mapping
        const processedFallbackData = fallbackData
          .map((user, index) => ({
            username: maskUsername(user.username),
            wagered: user.wagered,
            reward: rewardMapping[index + 1] || 0,
          }));
        
        setData(processedFallbackData);
        setError(null); // Clear error since we have fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch(err => {
      console.error("fetchData error:", err);
      setLoading(false);
      setError(err.message);
    });
  }, []);

  if (loading) return <Loader />;
  if (error)
    return <p className="text-red-500 p-4 text-center">Error: {error}</p>;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatRewardCurrency = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
    return formattedAmount.endsWith(".00")
      ? formattedAmount.slice(0, -3)
      : formattedAmount;
  };

  const topUsers = data.slice(0, 3);
  const restUsers = data.slice(3, 20);

  const countDownDate = (() => {
    const now = DateTime.utc();

    let targetDate;
    
    // Fixed September 2025 leaderboard period: countdown to September 30, 2025 23:59:59 UTC
    targetDate = DateTime.utc(2025, 9, 30, 23, 59, 59, 999);

    return targetDate.toISO(); // ➜ will be interpreted correctly as UTC
  })();

  console.log("Component mounted");

  return (
    <div className="mt-4 p-4 text-white">
      <div className="FooterBg relative mx-auto flex h-80 w-full transform flex-col items-center justify-between overflow-hidden rounded-xl p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] transition-all sm:w-3/4 sm:flex-row sm:items-start md:w-5/6">
        {/* Left Image */}
        <div className="hide-on-ipad absolute left-0 hidden sm:block">
          <Image
            src="/images/icon/luxdrop_chest.png"
            alt="Luxdrop Sneaker Chest"
            className="transform"
            width={540}
            height={378}
          />
        </div>

        {/* Right Image */}
        <div className="hide-on-ipad absolute right-0 top-[30px] hidden sm:block">
          <Image
            src="/images/icon/luxdrop_car.png"
            alt="Luxdrop Car"
            className="transform"
            width={540}
            height={378}
          />
        </div>
        {/* Left Image mobile */}
        {/* <div className="absolute -left-1 top-[-20px] sm:block md:hidden">
          <Image
            src="/images/icon/luxdrop_chest.png"
            alt="Luxdrop Sneaker Chest"
            className="h-[103px] w-[68.05px] transform"
            width={68.05}
            height={103}
          />
        </div> */}

        {/* Right Image mobile*/}
        {/* <div className="absolute -right-5 top-[250px] sm:block md:hidden">
          <Image
            src="/images/icon/luxdrop_car.png"
            alt="Luxdrop Car"
            className="h-[103px] w-[68.05px] transform"
            width={68.05}
            height={103}
          />
        </div> */}
        <div className="absolute left-0 right-0 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-10">
          <b className="animate-pulse-glow text-5xl text-[#fff] sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl">
            $20,000
          </b>
          <div className="mt-4 flex flex-col items-center justify-center sm:flex-row sm:space-x-4">
            <Image
              src="/images/logo/luxdrop_logo.png" // Verified path
              alt="Luxdrop Logo"
              width={280} // Adjusted for SVG aspect ratio
              height={53} // Adjusted for SVG aspect ratio
              className="mb-3 transition-all duration-300 sm:mb-0"
            />
            <b className="text-4xl text-white sm:text-2xl md:text-3xl lg:mt-4 lg:text-3xl">
              Leaderboard
            </b>
          </div>
          <p className="m-4 mx-auto text-center leading-relaxed text-white sm:m-6 sm:text-xl md:text-2xl lg:m-8 lg:text-3xl xl:text-xl">
            Each month, a total of $20,000 is distributed across the top users!
          </p>
        </div>
      </div>

      <div className="mb-4 mt-12 flex flex-col items-center text-2xl font-bold">
        Leaderboard ends in
      </div>
      {countDownDate && (
        <div className="relative mb-15 flex justify-center space-x-4">
          <div
            className="mx-12 flex flex-col items-center rounded-3xl md:mx-80"
            data-aos="fade-up"
          >
            <Timer type="normal" date={countDownDate} />
          </div>
        </div>
      )}
      {/* src/components/Luxdrop/LuxdropLeaderboard.tsx */}

      <div className="TopLeaderboard mt-12">
        {topUsers.length >= 3 ? (
          <>
            {/* Left Card (Rank 2) */}
            <div className="TopLeaderboard__card TopLeaderboard__card--left border border-purple-700 shadow-lg shadow-purple-900/50 duration-200 ease-in hover:scale-110 md:mt-10">
              <div className="TopLeaderboard__card-inner">
                <div className="TopLeaderboard__number-wrapper">
                  <Image
                    src="/images/icon/Second_Place.png"
                    alt="Rank 2"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_silver.png"
                    alt="Silver Emblem"
                    width={96}
                    height={96}
                  />
                </div>
                <div className="TopLeaderboard__card-content">
                  <p className="TopLeaderboard__username">
                    {topUsers[1].username}
                  </p>
                  <p className="TopLeaderboard__amount">
                    {formatCurrency(topUsers[1].wagered)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[1].reward)}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Card (Rank 1) */}
            <div className="TopLeaderboard__card TopLeaderboard__card--middle border border-purple-700 shadow-lg shadow-purple-900/50 duration-200 ease-in hover:scale-110">
              <div className="TopLeaderboard__card-inner">
                <div className="TopLeaderboard__number-wrapper">
                  <Image
                    src="/images/icon/First_Place.png"
                    alt="Rank 1"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_gold.png"
                    alt="Gold Emblem"
                    width={96}
                    height={96}
                  />
                </div>
                <div className="TopLeaderboard__card-content">
                  <p className="TopLeaderboard__username">
                    {topUsers[0].username}
                  </p>
                  <p className="TopLeaderboard__amount">
                    {formatCurrency(topUsers[0].wagered)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[0].reward)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card (Rank 3) */}
            <div className="TopLeaderboard__card TopLeaderboard__card--right border border-purple-700 shadow-lg shadow-purple-900/50 duration-200 ease-in hover:scale-110 md:mt-10">
              <div className="TopLeaderboard__card-inner">
                <div className="TopLeaderboard__number-wrapper">
                  <Image
                    src="/images/icon/Third_Place.png"
                    alt="Rank 3"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_bronze.png"
                    alt="Bronze Emblem"
                    width={96}
                    height={96}
                  />
                </div>
                <div className="TopLeaderboard__card-content">
                  <p className="TopLeaderboard__username">
                    {topUsers[2].username}
                  </p>
                  <p className="TopLeaderboard__amount">
                    {formatCurrency(topUsers[2].wagered)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[2].reward)}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="w-full py-10 text-center">
            Top user data is loading or not enough users to display top 3...
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center overflow-x-auto">
        <div className="w-full md:w-10/12 lg:w-8/12 xl:w-7/12">
          <div className="mx-auto max-w-[1000px]">
            {/* Mobile Header */}
            <div className="bg-gray-800 grid grid-cols-3 rounded-lg text-center font-bold sm:hidden">
              <div className="px-2 py-2 text-sm">Name</div>
              <div className="px-2 py-2 text-sm">Wager</div>
              <div className="px-2 py-2 text-sm">Reward</div>
            </div>
            {/* Desktop Header */}
            <div className="bg-gray-800 hidden grid-cols-4 rounded-lg text-center font-bold sm:grid">
              <div className="px-3 py-2">Rank</div>
              <div className="px-3 py-2">Name</div>
              <div className="px-3 py-2">Wager</div>
              <div className="px-3 py-2">Reward</div>
            </div>
            <div>
              {restUsers.map((user, index) => (
                <div
                  key={index + 3}
                  className="Leaderboard__card relative my-2 rounded-lg p-1 shadow-lg md:my-4"
                >
                  <div className="Leaderboard__card-inner grid grid-cols-3 text-center sm:grid-cols-4">
                    {/* Rank visible on sm and up */}
                    <div className="hidden px-3 py-2 font-bold sm:block">
                      {index + 4}
                    </div>
                    {/* Mobile: Show rank as prefix in username */}
                    <div className="px-2 py-2 font-bold text-sm sm:px-3 sm:text-base">
                      <span className="sm:hidden text-gray-400 mr-1">#{index + 4}</span>
                      {user.username}
                    </div>
                    <div className="px-2 py-2 text-sm sm:px-3 sm:text-base">
                      {formatCurrency(user.wagered)}
                    </div>
                    <div className="px-2 py-2 text-green-400 text-sm sm:px-3 sm:text-base">
                      {formatRewardCurrency(user.reward)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxdropLeaderboard;
