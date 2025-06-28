"use client";
import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import Loader from "@/components/common/Loader";
import { Timer } from "@/app/ui/timer/Timer";
import Footer from "@/components/Footer/Footer";
import { DateTime } from "luxon";
import Image from "next/image";

const API_PROXY_URL = "/api/LuxdropProxy";

// Define the type for the user object
interface User {
  username: string;
  wagerAmount: number;
  rewardAmount?: number;
}

// Define a static reward mapping based on rank
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
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [countdownDate, setCountdownDate] = useState<string>("");

  const fireworksLaunched = useRef(false); // Prevent multiple launches

  // Function to mask usernames with 4 asterisks in the middle
  const maskUsername = (username: string) => {
    const len = username.length;

    if (len <= 2) {
      return username; // Too short to mask
    }

    if (len <= 4) {
      return username[0] + "*".repeat(len - 2) + username[len - 1];
    }

    return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
  };

  // Format currency for wager amounts
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  // Format reward currency without decimals if it's an integer
  const formatRewardCurrency = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0, // Ensure there's no decimal part unless necessary
    }).format(amount);

    return formattedAmount.endsWith(".00")
      ? formattedAmount.slice(0, -3)
      : formattedAmount;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_PROXY_URL);
        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        // Correctly set countdown date (use BEFORE date)
        setCountdownDate(result.dates.beforeDate);

        // Correctly MAP the new API structure to the expected old one
        // Assuming Luxdrop API response structure for ranking, user.name, and total is similar.
        const mappedData: User[] = result.ranking.map((entry: any) => ({
          username: entry.user.name,
          wagerAmount: entry.total / 100, // Fix: Divide by 100
          rewardAmount: 0,
        }));

        // Sort by wagerAmount
        const sortedData = mappedData.sort(
          (a: User, b: User) => b.wagerAmount - a.wagerAmount,
        );

        // Assign rewards based on rank
        const leaderboardWithRewards = sortedData.map(
          (user: User, index: number) => {
            const rank = index + 1;
            user.rewardAmount = rewardMapping[rank] || 0;
            user.username = maskUsername(user.username); // Optional: mask usernames
            return user;
          },
        );

        // Now set into state
        setData(leaderboardWithRewards);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fireworks effect (this is safe to run on every render as long as we only trigger once for the first rank)
  useEffect(() => {
    if (data.length > 0 && !fireworksLaunched.current) {
      const topUsers = data.slice(0, 3);
      if (topUsers[0]) {
        fireworksLaunched.current = true; // Prevent multiple launches
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.6 },
        });
      }
    }
  }, [data]); // This will only trigger when `data` changes

  // Conditional rendering for loading and error states
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const topUsers = data.slice(0, 3);

  // Define the remaining users (after the top 3)
  const restUsers = data.slice(3, 20);
  // Calculate the countdown date (26th of the current or next month)
  const countDownDate = (() => {
  const now = DateTime.utc();

  const currentMonth = now.month;
  const currentYear = now.year;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  let targetDate;
  if (now.day < 27) {
    targetDate = DateTime.utc(currentYear, currentMonth, 27, 0, 0);
  } else {
    targetDate = DateTime.utc(nextMonthYear, nextMonth, 27, 0, 0);
  }

  return targetDate.toISO(); // ➜ will be interpreted correctly as UTC
})();

  return (
    <div className="mt-4 p-4 text-white">
      {/* Floating Image */}
      <div className="floating-image1 animate-line3">
        <Image
          src="/images/icon/richard_mille_red.webp"
          alt="Richard Mille Red"
          className="h-25 w-25 rotate-[-18.63deg]"
          width={100}
          height={100}
        />
      </div>
      <div className="floating-image2 animate-line3">
        <Image
          src="/images/icon/Patek_Aquanaut.webp"
          alt="Patek Aquanaut"
          className="h-25 w-25 rotate-[-18.63deg]"
          width={100}
          height={100}
        />
      </div>
      {/* <div className="floating-image3 animate-line3">
    <img src="/images/logo/sweet_flips_emblem.png" alt="Floating" className="h-300 w-25 rotate-[-18.63deg]" />
  </div> */}
      <div className="FooterBg relative mx-auto flex h-80 w-full transform flex-col items-center justify-between overflow-hidden rounded-xl p-4 transition-all sm:w-3/4 sm:flex-row sm:items-start md:w-5/6 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]">
        {/* Left Image */}
        <div className="hide-on-ipad absolute left-0 hidden sm:block">
          <Image
            src="/images/cover/Character Box Dior.png"
            alt="Luxdrop Box"
            className="transform"
            width={491}
            height={270}
          />
        </div>

        {/* Right Image */}
        <div className="hide-on-ipad absolute right-0 hidden sm:block">
          <Image
            src="/images/cover/G-Class Box Ranks.png"
            alt="Gclass Box"
            className="transform"
            width={449}
            height={312}
          />
        </div>
        {/* Left Image mobile */}
        {/* <div className="absolute -left-5 top-[280px] sm:block md:hidden">
        <Image
    src="/images/icon/Prismatic_Cards.webp"
    alt="Prismatic Cards"
    className="h-[103px] w-[68.05px] rotate-[18.63deg] transform"
    width={68.05}
    height={103}
  />
        </div> */}

        {/* Right Image mobile*/}
        {/* <div className="absolute -right-5 top-[280px] sm:block md:hidden">
        <Image
    src="/images/icon/Sweetflips_Pack.webp"
    alt="Sweetflips Pack"
    className="h-[103px] w-[68.05px] rotate-[-18.63deg] transform"
    width={68.05}
    height={103}
  />
        </div> */}

        {/* Centered Text Section */}
        <div className="absolute left-0 right-0 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-10">
          {/* $20,000 Text */}
          <b className="text-5xl text-[#FE25F7] sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl animate-pulse-glow">
            $20,000
          </b>

          {/* Image and Leaderboard Layout */}
          <div className="mt-4 flex flex-col items-center justify-center sm:flex-row sm:space-x-4">
            {/* Luxdrop Logo */}
            <Image
              src="/images/logo/luxdrop_logo.svg"
              alt="Luxdrop Logo"
              className="mb-3 transition-all duration-300 sm:mb-0 sm:w-[150px] md:w-[200px] lg:w-[300px] xl:w-[250px]"
              width={178}
              height={34}
              sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, 250px"
            />
            {/* Leaderboard Text */}
            <b className="text-4xl text-white sm:text-2xl md:text-3xl lg:mt-4 lg:text-3xl">
              Leaderboard
            </b>
          </div>

          {/* Description Text */}
          <p className="m-4 mx-auto text-center text-white sm:m-6 sm:text-xl md:text-2xl lg:m-8 lg:text-3xl xl:text-xl leading-relaxed">
            Each month, a total of $20,000 is distributed across 10 users based
            on<br></br>
            their total wagered amount.
          </p>
        </div>
      </div>
      <div className="mb-4 mt-12 flex flex-col items-center text-2xl font-bold">
        Leaderboard ends in
      </div>
      <div className="relative mb-15 flex justify-center space-x-4">
        {countDownDate && (
          <div
            className="mx-12 flex flex-col items-center rounded-3xl md:mx-80"
            data-aos="fade-up"
          >
            <Timer type="normal" date={countDownDate} />
          </div>
        )}
      </div>

      {/* Top 3 Users (Responsive with Badge) */}
      <div className="TopLeaderboard">
        {topUsers && topUsers.length >= 3 && (
          <>
            {/* Left Card */}
            <div className="TopLeaderboard__card TopLeaderboard__card--left duration-200 ease-in hover:scale-110 md:mt-10 border border-purple-700 shadow-lg shadow-purple-900/50">
              <div className="TopLeaderboard__card-inner">
                <div className="TopLeaderboard__number-wrapper">
                  <Image
                    src="/images/icon/Second_Place.png"
                    alt="Second Place"
                    className="h-8 w-8"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_silver.png"
                    alt="Sweetflips Emblem Silver"
                    className="h-24 w-24"
                    width={96}
                    height={96}
                  />
                </div>
                <div className="TopLeaderboard__card-content">
                  <p className="TopLeaderboard__username">
                    {topUsers[1].username}
                  </p>
                  <p className="TopLeaderboard__amount">
                    {formatCurrency(topUsers[1].wagerAmount)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[1].rewardAmount!)}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Card */}
            <div className="TopLeaderboard__card TopLeaderboard__card--middle duration-200 ease-in hover:scale-110 border border-purple-700 shadow-lg shadow-purple-900/50">
              <div className="TopLeaderboard__card-inner">
                <div className="TopLeaderboard__number-wrapper">
                  <Image
                    src="/images/icon/First_Place.png"
                    alt="First Place"
                    className="h-8 w-8"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_gold.png"
                    alt="Sweetflips Emblem Gold"
                    className="h-24 w-24"
                    width={96}
                    height={96}
                  />
                </div>
                <div className="TopLeaderboard__card-content">
                  <p className="TopLeaderboard__username">
                    {topUsers[0].username}
                  </p>
                  <p className="TopLeaderboard__amount">
                    {formatCurrency(topUsers[0].wagerAmount)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[0].rewardAmount!)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="TopLeaderboard__card TopLeaderboard__card--right duration-200 ease-in hover:scale-110 md:mt-10 border border-purple-700 shadow-lg shadow-purple-900/50">
              <div className="TopLeaderboard__card-inner">
                <div className="TopLeaderboard__number-wrapper">
                  <Image
                    src="/images/icon/Third_Place.png"
                    alt="Third Place"
                    className="h-8 w-8"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_bronze.png"
                    alt="Sweetflips Emblem Bronze"
                    className="h-24 w-24"
                    width={96}
                    height={96}
                  />
                </div>
                <div className="TopLeaderboard__card-content">
                  <p className="TopLeaderboard__username">
                    {topUsers[2].username}
                  </p>
                  <p className="TopLeaderboard__amount">
                    {formatCurrency(topUsers[2].wagerAmount)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[2].rewardAmount!)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center overflow-x-auto">
        <div className="w-full md:w-10/12 lg:w-8/12 xl:w-7/12">
          {/* Table Header (Only visible on larger screens) */}
          <div className="max-w-[1000px] mx-auto"> {/* This is the new wrapper */}
            <div className="bg-gray-800 hidden sm:grid grid-cols-4 rounded-lg text-center font-bold">
              <div className="px-3 py-2">Rank</div>
              <div className="px-3 py-2">Name</div>
              <div className="px-3 py-2">Wager</div>
              <div className="px-3 py-2">Reward</div>
            </div>
          </div>

          {/* Leaderboard rows */}
          <div>
            {restUsers.map((user, index) => (
              <div
                key={index}
                className="Leaderboard__card relative my-2 rounded-lg p-1 shadow-lg md:my-4"
              >
                {/* Row Content (Rank First on Desktop, Single Row on Mobile) */}
                <div className="Leaderboard__card-inner grid grid-cols-3 text-center sm:grid-cols-4">
                  {/* Rank in the first column on Desktop */}
                  <div className="hidden sm:block px-3 py-2 font-bold">
                    {index + 4}
                  </div>
                  <div className="px-3 py-2 font-bold">{user.username}</div>
                  <div className="px-3 py-2">{formatCurrency(user.wagerAmount)}</div>
                  <div className="text-red-400 px-3 py-2"> {/* Ensure existing text color class is maintained */}
                    {formatRewardCurrency(user.rewardAmount!)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LuxdropLeaderboard;
