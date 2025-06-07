"use client";
import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import Loader from "@/components/common/Loader";
import { Timer } from "@/app/ui/timer/Timer";
import Footer from "@/components/Footer/Footer";
import { DateTime } from "luxon";
import Image from "next/image";

const API_PROXY_URL = "/api/RazedProxy";

type LeaderboardEntry = {
  username: string;
  wagered: number;
  reward: number;
};

// Define the reward mapping based on rank
const rewardMapping: { [key: number]: number } = {
  1: 15000,
  2: 8000,
  3: 5000,
  4: 1100,
  5: 1000,
  6: 950,
  7: 900,
  8: 850,
  9: 800,
  10: 750,
  11: 700,
  12: 650,
  13: 600,
  14: 550,
  15: 500,
  16: 450,
  17: 400,
  18: 350,
  19: 325,
  20: 275,
  21: 250,
  22: 225,
  23: 200,
  24: 150,
  25: 75,
};

const RazedLeaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const fireworksLaunched = useRef(false); // Prevent multiple launches

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Function to open and close the popup
  const togglePopup = () => {
    setIsPopupOpen((prevState) => !prevState);
  };

  // Function to mask usernames with 4 asterisks in the middle
  const maskUsername = (username: string) => {
    const len = username.length;
  
    if (len <= 2) {
      return username; // Too short to mask
    }
  
    if (len <= 4) {
      return username[0] + '*'.repeat(len - 2) + username[len - 1];
    }
  
    return username.slice(0, 2) + '*'.repeat(len - 4) + username.slice(-2);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_PROXY_URL, { method: "GET" });
        const result = await response.json();
  
        if (!Array.isArray(result.data)) {
          throw new Error("Invalid data format: expected 'data' array");
        }
  
        const parsedData = result.data.map((user: any): LeaderboardEntry => ({
          username: maskUsername(user.username),
          wagered: parseFloat(user.wagered),
          reward: 0,
        }));
  
        const sortedData: LeaderboardEntry[] = parsedData
          .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.wagered - a.wagered)
          .map((user: LeaderboardEntry, index: number) => ({
            ...user,
            reward: rewardMapping[index + 1] || 0,
          }));
  
        setData(sortedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);  

  const topUsers = data.slice(0, 3);

  useEffect(() => {
    if (topUsers[0] && !fireworksLaunched.current) {
      fireworksLaunched.current = true; // Prevent multiple launches
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
      });
    }
  }, [topUsers]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // Get the current month (1-based)
      const currentYear = now.getFullYear();

      let targetDate: Date;

      // If it's before the 23th, set the target date to the 23th of the current month
      // If it's the 23th or later, set the target date to the 23th of the next month
      if (now.getDate() < 24) {
        targetDate = new Date(currentYear, currentMonth - 1, 23); // 23th of the current month
      } else {
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextMonthYear =
          currentMonth === 12 ? currentYear + 1 : currentYear;
        targetDate = new Date(nextMonthYear, nextMonth - 1, 23); // 23th of the next month
      }

      const diff = targetDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

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

  const restUsers = data.slice(3, 25);

  // Calculate the countdown date (16th of the current or next month)
  const countDownDate = (() => {
    const now = DateTime.utc();
const currentMonth = now.month;
const currentYear = now.year;
const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

let targetDate;
if (now.day < 23) {
  targetDate = DateTime.utc(currentYear, currentMonth, 23, 0, 0);
} else {
  targetDate = DateTime.utc(nextMonthYear, nextMonth, 23, 0, 0);
}

return targetDate.toISO(); // ISO in UTC
  })();

  return (
    <div className="mt-4 p-4 text-white">
      {/* Floating Image */}
      <div className="floating-image1 animate-rotating">
        <Image
          src="/images/icon/Razed_coin.png"
          alt="Razed Coin"
          width={120}
          height={120}
        />
      </div>
      <div className="floating-image2 animate-rotating">
        <Image
          src="/images/icon/Razed_coin2.png"
          alt="Razed Coin"
          width={100}
          height={100}
        />
      </div>
      <div className="FooterBg relative mx-auto flex h-80 w-full transform flex-col items-center justify-between overflow-hidden rounded-xl p-4 transition-all sm:w-3/4 sm:flex-row sm:items-start md:w-5/6">
        {/* Left Image */}
        <div className="hide-on-ipad absolute left-0 hidden sm:block">
          <Image
            src="/images/icon/Razed_777.png"
            alt="Razed Slot777"
            className="transform"
            width={272}
            height={408}
          />
        </div>

        {/* Right Image */}
        <div className="hide-on-ipad absolute right-0 top-[30px] hidden sm:block">
          <Image
            src="/images/icon/Razed_cards.png"
            alt="Razed Cards"
            className="transform"
            width={272}
            height={408}
          />
        </div>
        {/* Left Image mobile */}
        <div className="absolute -left-1 top-[-20px] sm:block md:hidden">
          <Image
            src="/images/icon/Razed_777.png"
            alt="Razed Slot777"
            className="h-[103px] w-[68.05px] transform"
            width={68.05}
            height={103}
          />
        </div>

        {/* Right Image mobile*/}
        <div className="absolute -right-5 top-[250px] sm:block md:hidden">
          <Image
            src="/images/icon/Razed_cards.png"
            alt="Razed Cards"
            className="h-[103px] w-[68.05px] transform"
            width={68.05}
            height={103}
          />
        </div>

        {/* Centered Text Section */}
        <div className="absolute left-0 right-0 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-10">
          {/* $40,000 Text */}
          <b className="text-4xl text-[#4D4EE0] sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl">
            $40,000
          </b>

          {/* Image and Leaderboard Layout */}
          <div className="mt-4 flex flex-col items-center justify-center sm:flex-row sm:space-x-4">
            {/* Razed Logo */}
            <Image
              src="/images/logo/Razed_Logo.png"
              alt="Razed Logo"
              className="mb-3 transition-all duration-300 sm:mb-0 sm:w-[150px] md:w-[200px] lg:w-[250px] xl:w-[250px]"
              width={200} // Default width for the image
              height={100} // You can adjust the height as per the aspect ratio of the image
              sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, 250px" // Optional: specifies how the image should scale on different screen sizes
            />
            {/* Leaderboard Text */}
            <b className="text-4xl text-white sm:text-2xl md:text-3xl lg:text-3xl">
              Leaderboard
            </b>
          </div>

          {/* Description Text */}
          <p className="mx-auto mt-4 text-center text-white sm:text-xl md:mt-0 md:text-2xl lg:m-4 lg:text-3xl xl:text-xl">
            Each month, a total of $40,000 is distributed across 25 users
            <br></br>
            based on their total wagered amount.
          </p>
        </div>
      </div>
      <div className="mb-4 mt-8 flex flex-col items-center text-2xl font-bold">
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
            <div className="TopLeaderboard__card TopLeaderboard__card--left duration-200 ease-in hover:scale-110 md:mt-10">
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
                    {formatCurrency(topUsers[1].wagered)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[1].reward!)}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Card */}
            <div className="TopLeaderboard__card TopLeaderboard__card--middle duration-200 ease-in hover:scale-110">
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
                    {formatCurrency(topUsers[0].wagered)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[0].reward!)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="TopLeaderboard__card TopLeaderboard__card--right duration-200 ease-in hover:scale-110 md:mt-10">
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
                    {formatCurrency(topUsers[2].wagered)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[2].reward!)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Table */}
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
                  {/* Rank in the first column on Desktop, hidden on mobile */}
                  <div className="hidden sm:block px-3 py-2 font-bold">
                    {index + 4}
                  </div>
                  <div className="px-3 py-2 font-bold">{user.username}</div>
                  <div className="px-3 py-2">{formatCurrency(user.wagered)}</div>
                  <div className="text-red-400 px-3 py-2"> {/* Ensure existing text color class is maintained if needed */}
                    {formatRewardCurrency(user.reward!)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RazedLeaderboard;