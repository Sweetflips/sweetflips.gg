// src/components/Luxdrop/LuxdropLeaderboard.tsx
"use client";
import { Timer } from "@/app/ui/timer/Timer";
import Loader from "@/components/common/Loader";
import { DateTime } from "luxon";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const API_PROXY_URL = "/api/LuxdropProxy";

type LeaderboardEntry = {
  username: string;
  wagered: number;
  reward: number;
  rank?: number;
};

const rewardMapping: { [key: number]: number } = {
  1: 4250,
  2: 2100,
  3: 1050,
  4: 700,
  5: 500,
  6: 350,
  7: 300,
  8: 275,
  9: 250,
  10: 225,
  11: 200,
  12: 180,
  13: 160,
  14: 130,
  15: 110,
  16: 80,
  17: 50,
  18: 40,
  19: 30,
  20: 20,
};

const parseCurrencyAmount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  let sanitized = value.trim().toUpperCase().replace(/[^0-9.,KMB]/g, "");
  let multiplier = 1;
  let numericPortion = sanitized;
  if (sanitized.endsWith("K")) {
    multiplier = 1_000;
    numericPortion = sanitized.slice(0, -1);
  } else if (sanitized.endsWith("M")) {
    multiplier = 1_000_000;
    numericPortion = sanitized.slice(0, -1);
  } else if (sanitized.endsWith("B")) {
    multiplier = 1_000_000_000;
    numericPortion = sanitized.slice(0, -1);
  }
  // Simple: Remove separators, assume "." is decimal for now.
  numericPortion = numericPortion.replace(/,/g, "");
  const parsed = parseFloat(numericPortion);
  if (Number.isNaN(parsed)) return 0;
  return parsed * multiplier;
};

const LuxdropLeaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to mask usernames (copied from RazedLeaderboard)
  const maskUsername = (username: string) => {
    if (!username) return "";
    const len = username.length;
    if (len <= 2) return username;
    if (len <= 4) return username[0] + "*".repeat(len - 2) + username[len - 1];
    return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_PROXY_URL, { method: "GET" });
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: response.statusText };
          }
          throw new Error(
            `API returned ${response.status}: ${errorData.message || response.statusText}`
          );
        }
        const result = await response.json();
        if (!result.data || !Array.isArray(result.data))
          throw new Error("Invalid data format from API");
        const processedData = result.data
          .filter((user: any) => user.username)
          .slice(0, 20)
          .map((user: any, index: number) => {
            const rank = user.rank !== undefined ? user.rank : index + 1;
            const wagered =
              typeof user.wagered === "number"
                ? user.wagered
                : parseCurrencyAmount(user.wagered);
            const rewardFromApi =
              typeof user.reward === "number"
                ? user.reward
                : parseCurrencyAmount(user.reward);
            const reward =
              rewardFromApi > 0 ? rewardFromApi : rewardMapping[rank] || 0;
            return {
              username: maskUsername(user.username),
              wagered,
              reward,
              rank,
            };
          });
        if (isMounted) {
          setData(processedData);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(`Unable to load leaderboard: ${err.message}`);
          setLoading(false);
        }
      }
    };

    fetchData();
    // Refresh leaderboard every 5 minutes
    const interval = setInterval(fetchData, 300_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Duplicate of logic above but for retry
    fetch(API_PROXY_URL, { method: "GET" })
      .then(async (response) => {
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: response.statusText };
          }
          throw new Error(
            `API returned ${response.status}: ${errorData.message || response.statusText}`
          );
        }
        return response.json();
      })
      .then((result) => {
        if (!result.data || !Array.isArray(result.data))
          throw new Error("Invalid data format from API");
        const processedData = result.data
          .filter((user: any) => user.username)
          .slice(0, 20)
          .map((user: any, index: number) => {
            const rank = user.rank !== undefined ? user.rank : index + 1;
            const wagered =
              typeof user.wagered === "number"
                ? user.wagered
                : parseCurrencyAmount(user.wagered);
            const rewardFromApi =
              typeof user.reward === "number"
                ? user.reward
                : parseCurrencyAmount(user.reward);
            const reward =
              rewardFromApi > 0 ? rewardFromApi : rewardMapping[rank] || 0;
            return {
              username: maskUsername(user.username),
              wagered,
              reward,
              rank,
            };
          });
        setData(processedData);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(`Unable to load leaderboard: ${err.message}`);
        setLoading(false);
      });
  };

  if (loading) return <Loader />;
  if (error && data.length === 0)
    return (
      <div className="text-red-500 p-4 text-center">
        <p className="mb-4">Error: {error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );

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

  const { targetDate, periodStart, periodLabel } = (() => {
    const now = DateTime.utc();
    const currentDay = now.day;
    const currentMonth = now.month;
    const currentYear = now.year;

    // Luxdrop period configuration - configurable via environment variables
    const luxdropPeriodYearEnv = process.env.NEXT_PUBLIC_LUXDROP_PERIOD_YEAR;
    const luxdropPeriodMonthEnv = process.env.NEXT_PUBLIC_LUXDROP_PERIOD_MONTH;

    const periodYear = luxdropPeriodYearEnv ? parseInt(luxdropPeriodYearEnv, 10) : currentYear;
    const periodMonth = luxdropPeriodMonthEnv ? parseInt(luxdropPeriodMonthEnv, 10) : currentMonth;

    let periodStartDate: DateTime;
    let periodEndDate: DateTime;
    let periodLabel: string;

    if (currentMonth === periodMonth && currentYear === periodYear) {
      if (currentDay >= 1 && currentDay <= 15) {
        periodStartDate = DateTime.utc(periodYear, periodMonth, 1, 0, 0, 0);
        periodEndDate = DateTime.utc(periodYear, periodMonth, 15, 23, 59, 59);
        periodLabel = `${DateTime.fromObject({ month: periodMonth, year: periodYear }).toFormat('MMMM')} 1-15, ${periodYear}`;
      } else {
        periodStartDate = DateTime.utc(periodYear, periodMonth, 16, 0, 0, 0);
        periodEndDate = DateTime.utc(periodYear, periodMonth, 30, 23, 59, 59);
        periodLabel = `${DateTime.fromObject({ month: periodMonth, year: periodYear }).toFormat('MMMM')} 16-30, ${periodYear}`;
      }
    } else {
      periodStartDate = DateTime.utc(periodYear, periodMonth, 1, 0, 0, 0);
      periodEndDate = DateTime.utc(periodYear, periodMonth, 15, 23, 59, 59);
      periodLabel = `${DateTime.fromObject({ month: periodMonth, year: periodYear }).toFormat('MMMM')} 1-15, ${periodYear}`;
    }

    return {
      targetDate: periodEndDate,
      periodStart: periodStartDate,
      periodLabel,
    };
  })();

  const countDownDate = targetDate.toISO();

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

        <div className="absolute left-0 right-0 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-10">
          <b className="animate-pulse-glow text-5xl text-[#fff] sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl">
            $22,000
          </b>
          <div className="mt-4 flex flex-col items-center justify-center sm:flex-row sm:space-x-4">
            <Image
              src="/images/logo/luxdrop_logo.svg"
              alt="Luxdrop Logo"
              width={280}
              height={53}
              className="mb-3 transition-all duration-300 sm:mb-0"
            />
            <b className="text-4xl text-white sm:text-2xl md:text-3xl lg:mt-4 lg:text-3xl">
              Leaderboard
            </b>
          </div>
          <p className="m-4 mx-auto text-center leading-relaxed text-white sm:m-6 sm:text-xl md:text-2xl lg:m-8 lg:text-3xl xl:text-xl">
            Every two weeks, a total of $11,000 is distributed across the top 20 users!
          </p>
        </div>
      </div>

      <div className="mb-4 mt-12 flex flex-col items-center text-2xl font-bold">
        Bi-weekly Leaderboard ends in
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
