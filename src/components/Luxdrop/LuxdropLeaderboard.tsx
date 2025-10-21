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

const normalizeNumericPortion = (input: string): number => {
  let numericPortion = input.trim();

  // Detect decimal separator heuristically (last occurrence wins).
  const lastComma = numericPortion.lastIndexOf(",");
  const lastDot = numericPortion.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    // Both present: whichever appears last is the decimal separator.
    if (lastComma > lastDot) {
      numericPortion = numericPortion.replace(/\./g, "").replace(",", ".");
    } else {
      numericPortion = numericPortion.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    const fractionalLength = numericPortion.length - lastComma - 1;
    if (fractionalLength === 3) {
      // Example: 1,234 -> thousands separator
      numericPortion = numericPortion.replace(/,/g, "");
    } else {
      // Example: 36,5 -> decimal
      numericPortion = numericPortion.replace(",", ".");
    }
  } else if (lastDot !== -1) {
    const fractionalLength = numericPortion.length - lastDot - 1;
    if (fractionalLength === 3) {
      // Example: 1.234 -> thousands separator (European formatting)
      numericPortion = numericPortion.replace(/\./g, "");
    }
    // Otherwise treat dot as decimal (e.g. 36.5)
  }

  const parsed = parseFloat(numericPortion);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
};

const parseCurrencyAmount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const sanitized = value.trim().toUpperCase().replace(/[^0-9.,KMB-]/g, "");

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

  return normalizeNumericPortion(numericPortion) * multiplier;
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

  const lastFetchTimeRef = useRef(0);
  const TEN_MINUTES = 10 * 60 * 1000; // 10 minutes = 600,000 milliseconds
  console.log("🔧 TEN_MINUTES constant:", TEN_MINUTES);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (showLoader = false, force = false) => {
      const now = Date.now();

      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      console.log(`⏱️ Time since last fetch: ${timeSinceLastFetch / 1000}s, Required: ${TEN_MINUTES / 1000}s`);

      // Only fetch if 10 minutes have passed since last fetch, unless forced
      if (!force && timeSinceLastFetch < TEN_MINUTES) {
        console.log(`⏰ Skipping Luxdrop fetch - only ${timeSinceLastFetch / 1000}s since last fetch (need ${TEN_MINUTES / 1000}s)`);
        return;
      }

      if (showLoader) {
        setLoading(true);
      }
      if (isMounted) {
        setError(null);
      }

      console.log("🔄 Fetching Luxdrop data...");
      lastFetchTimeRef.current = now;
      console.log(`✅ Updated lastFetchTime to: ${now}`);

      try {
        const response = await fetch(API_PROXY_URL);
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Invalid data format from API");
        }

        const processedData = result.data
          .filter((user: any) => user.username)
          .slice(0, 20)
          .map((user: any, index: number) => {
            const wageredRaw = user.wagered;
            const rewardRaw = user.reward;
            const wagered = parseCurrencyAmount(wageredRaw);
            const rewardFromApi = parseCurrencyAmount(rewardRaw);

            if (index === 0) {
              console.log("Luxdrop raw top user", {
                username: user.username,
                wageredRaw,
                wageredParsed: wagered,
                rewardRaw,
                rewardParsed: rewardFromApi,
              });
            }

            const reward =
              rewardFromApi > 0 ? rewardFromApi : rewardMapping[index + 1] || 0;

            return {
              username: maskUsername(user.username),
              wagered,
              reward,
            };
          });

        if (isMounted) {
          console.table(processedData.slice(0, 5), ["username", "wagered", "reward"]);
          setData(processedData);
        }
      } catch (err: any) {
        console.error("Luxdrop API error:", err.message);
        if (isMounted) {
          setError(`Unable to load leaderboard: ${err.message}`);
        }
      } finally {
        if (showLoader && isMounted) {
          setLoading(false);
        }
      }
    };

    console.log("🚀 LuxdropLeaderboard mounted - setting up 10-minute interval");
    fetchData(true, true); // Initial fetch

    // Set up interval for every 10 minutes
    const refreshInterval = window.setInterval(() => {
      console.log("⏰ 10-minute interval triggered - calling fetchData");
      fetchData(false, false);
    }, TEN_MINUTES);

    console.log(`📅 Next fetch scheduled in ${TEN_MINUTES / 1000} seconds`);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
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

  const { targetDate, periodStart, periodLabel } = (() => {
    const periodStartDate = DateTime.utc(2025, 10, 16, 0, 0, 0);
    const periodEndDate = DateTime.utc(2025, 10, 31, 23, 59, 59);

    return {
      targetDate: periodEndDate,
      periodStart: periodStartDate,
      periodLabel: "October 16-31, 2025",
    };
  })();

  const countDownDate = targetDate.toISO();

  console.log("Luxdrop period debug", {
    nowUtc: DateTime.utc().toISO(),
    period: periodLabel,
    periodStartUtc: periodStart.toISO(),
    periodStartEastern: periodStart.setZone("America/New_York").toISO(),
    nextResetUtc: countDownDate,
    nextResetEastern: countDownDate ? DateTime.fromISO(countDownDate, { zone: "utc" })
      .setZone("America/New_York")
      .toISO() : null,
  });

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
            $22,000
          </b>
          <div className="mt-4 flex flex-col items-center justify-center sm:flex-row sm:space-x-4">
            <Image
              src="/images/logo/Icon colored.png" // Verified path
              alt="Luxdrop Logo"
              width={80} // Adjusted for crown logo aspect ratio
              height={80} // Adjusted for crown logo aspect ratio
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
