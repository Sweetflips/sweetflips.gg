// src/components/Luxdrop/LuxdropLeaderboard.tsx
"use client";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchData = async () => {
      if (process.env.NODE_ENV === "development") {
        try {
          const response = await fetch(API_PROXY_URL);
          if (!response.ok)
            throw new Error("API failed, using mock data for layout.");
          const result = await response.json();
          if (!result.data || !Array.isArray(result.data))
            throw new Error("Invalid API format, using mock data.");
          setData(result.data); // Use real data if successful
        } catch (devError: any) {
          console.warn(`DEV MODE: ${devError.message}`);
          setData(mockLeaderboardData); // Fallback to mock data on any error
          setError(null); // Clear the error so the layout renders
        } finally {
          setLoading(false);
        }
        return; // End execution for dev mode
      }

      try {
        const response = await fetch(API_PROXY_URL);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch leaderboard data",
          );
        }
        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
          // Expect data under a 'data' key
          throw new Error("Invalid data format from proxy");
        }

        // Assign rewards based on the sorted rank from the proxy
        const leaderboardWithRewards = result.data.map(
          (user: any, index: number) => ({
            ...user,
            username: user.username, // username is already the code from proxy
            wagered: Number(user.wagered) || 0, // Ensure wagered is a number
            reward: rewardMapping[index + 1] || 0,
          }),
        );

        setData(leaderboardWithRewards);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

    const currentMonth = now.month;
    const currentYear = now.year;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    let targetDate;
    if (now.day < 28) {
      targetDate = DateTime.utc(currentYear, currentMonth, 28, 0, 0);
    } else {
      targetDate = DateTime.utc(nextMonthYear, nextMonth, 28, 0, 0);
    }

    return targetDate.toISO(); // ➜ will be interpreted correctly as UTC
  })();

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
        <div className="absolute -left-1 top-[-20px] sm:block md:hidden">
          <Image
            src="/images/icon/luxdrop_chest.png"
            alt="Luxdrop Sneaker Chest"
            className="h-[103px] w-[68.05px] transform"
            width={68.05}
            height={103}
          />
        </div>

        {/* Right Image mobile*/}
        <div className="absolute -right-5 top-[250px] sm:block md:hidden">
          <Image
            src="/images/icon/luxdrop_car.png"
            alt="Luxdrop Car"
            className="h-[103px] w-[68.05px] transform"
            width={68.05}
            height={103}
          />
        </div>
        <div className="absolute left-0 right-0 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-10">
          <b className="animate-pulse-glow text-5xl text-[#FE25F7] sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl">
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
                    {" "}
                    {/* Adjusted for mobile: remove rank */}
                    <div className="hidden px-3 py-2 font-bold sm:block">
                      {index + 4}
                    </div>{" "}
                    {/* Rank visible on sm and up */}
                    <div className="px-3 py-2 font-bold">{user.username}</div>
                    <div className="px-3 py-2">
                      {formatCurrency(user.wagered)}
                    </div>
                    <div className="px-3 py-2 text-green-400">
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
