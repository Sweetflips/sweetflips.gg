// src/components/Luxdrop/LuxdropLeaderboard.tsx
"use client";
import { Timer } from "@/app/ui/timer/Timer";
import Loader from "@/components/common/Loader";
import { DateTime } from "luxon";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

const API_PROXY_URL = "/api/LuxdropProxy";

type LeaderboardEntry = {
  username: string;
  wagered: number;
  reward: number;
  rank?: number;
};

type ApiLeaderboardEntry = {
  username?: unknown;
  wagered?: unknown;
  reward?: unknown;
  rank?: unknown;
};

const rewardMapping: { [key: number]: number } = {
  1: 5000,
  2: 2000,
  3: 1000,
  4: 750,
  5: 400,
  6: 300,
  7: 250,
  8: 150,
  9: 100,
  10: 50,
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

const formatUsdCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatUsdReward = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unknown error";

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === "AbortError";

const maskUsername = (username: string) => {
  if (!username) return "";
  const len = username.length;
  if (len <= 2) return username;
  if (len <= 4) return username[0] + "*".repeat(len - 2) + username[len - 1];
  return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
};

const calculatePeriod = () => {
  const periodStartDate = DateTime.utc(2026, 2, 23, 0, 0, 0);
  const periodEndDate = DateTime.utc(2026, 3, 1, 23, 59, 59);

  return {
    startDate: periodStartDate.toISODate(),
    endDate: periodEndDate.toISODate(),
    periodStart: periodStartDate,
    periodEnd: periodEndDate,
  };
};

const buildLuxdropUrl = (): string => {
  const period = calculatePeriod();
  return `${API_PROXY_URL}?startDate=${encodeURIComponent(period.startDate || "")}&endDate=${encodeURIComponent(period.endDate || "")}`;
};

const normalizeLeaderboardData = (
  rows: ApiLeaderboardEntry[],
): LeaderboardEntry[] =>
  rows
    .filter((user) => typeof user.username === "string" && user.username.trim().length > 0)
    .slice(0, 10)
    .map((user, index) => {
      const rank =
        typeof user.rank === "number" && Number.isFinite(user.rank)
          ? user.rank
          : index + 1;
      const wagered = parseCurrencyAmount(user.wagered);
      const rewardFromApi = parseCurrencyAmount(user.reward);
      const reward = rewardFromApi > 0 ? rewardFromApi : rewardMapping[rank] || 0;

      return {
        username: maskUsername(String(user.username)),
        wagered,
        reward,
        rank,
      };
    });

const LuxdropLeaderboard = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const leaderboardStartsAt = DateTime.utc(2026, 3, 1, 0, 0, 0);
  const isComingSoon = DateTime.utc() < leaderboardStartsAt;

  const fetchLeaderboard = useCallback(
    async (signal?: AbortSignal): Promise<LeaderboardEntry[]> => {
      const response = await fetch(buildLuxdropUrl(), {
        method: "GET",
        signal,
      });

      if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
          errorData = (await response.json()) as { message?: string };
        } catch {
          errorData = { message: response.statusText };
        }
        throw new Error(
          `API returned ${response.status}: ${errorData.message || response.statusText}`,
        );
      }

      const result = (await response.json()) as { data?: unknown };
      if (!Array.isArray(result.data)) {
        throw new Error("Invalid data format from API");
      }

      return normalizeLeaderboardData(result.data as ApiLeaderboardEntry[]);
    },
    [],
  );

  useEffect(() => {
    if (isComingSoon) {
      setLoading(false);
      setError(null);
      setData([]);
      return;
    }

    let isMounted = true;
    let activeController: AbortController | null = null;

    const fetchData = async (showLoader: boolean) => {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);

      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        const processedData = await fetchLeaderboard(controller.signal);
        if (isMounted) {
          setData(processedData);
        }
      } catch (err: unknown) {
        if (!isMounted || isAbortError(err)) return;
        setError(`Unable to load leaderboard: ${getErrorMessage(err)}`);
      } finally {
        if (isMounted && showLoader) {
          setLoading(false);
        }
      }
    };

    void fetchData(true);
    // Refresh leaderboard every 5 minutes
    const interval = window.setInterval(() => {
      void fetchData(false);
    }, 300_000);
    return () => {
      isMounted = false;
      activeController?.abort();
      window.clearInterval(interval);
    };
  }, [fetchLeaderboard, isComingSoon]);

  const handleRetry = async () => {
    if (isComingSoon) return;
    setError(null);
    setLoading(true);

    try {
      const processedData = await fetchLeaderboard();
      setData(processedData);
    } catch (err: unknown) {
      setError(`Unable to load leaderboard: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (isComingSoon)
    return (
      <div className="mt-12 p-6 text-center text-white">
        <h2 className="text-3xl font-bold sm:text-4xl">Coming soon</h2>
        <p className="mt-4 text-lg sm:text-xl">
          LuxDrop leaderboard starts on March 1, 2026.
        </p>
      </div>
    );

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

  const formatCurrency = (amount: number) => formatUsdCurrency.format(amount);

  const formatRewardCurrency = (amount: number) => {
    const formattedAmount = formatUsdReward.format(amount);
    return formattedAmount.endsWith(".00")
      ? formattedAmount.slice(0, -3)
      : formattedAmount;
  };

  const topUsers = data.slice(0, 3);
  const restUsers = data.slice(3, 10);

  const period = calculatePeriod();
  const targetDate = period.periodEnd;

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
            priority
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
            priority
          />
        </div>

        <div className="absolute left-0 right-0 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-10">
          <b className="animate-pulse-glow text-5xl text-[#fff] sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl">
            $10,000
          </b>
          <div className="mt-4 flex flex-col items-center justify-center sm:flex-row sm:space-x-4">
            <Image
              src="/images/logo/luxdrop_logo.svg"
              alt="Luxdrop Logo"
              width={280}
              height={53}
              className="mb-3 transition-all duration-300 sm:mb-0"
              priority
            />
            <b className="text-4xl text-white sm:text-2xl md:text-3xl lg:mt-4 lg:text-3xl">
              Leaderboard
            </b>
          </div>
          <p className="m-4 mx-auto text-center leading-relaxed text-white sm:m-6 sm:text-xl md:text-2xl lg:m-8 lg:text-3xl xl:text-xl">
            Every month, a total of $10,000 is distributed across the top 10 users!
          </p>
        </div>
      </div>

      <div className="mb-4 mt-12 flex flex-col items-center text-2xl font-bold">
        Monthly Leaderboard ends in
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
                    priority
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_silver.png"
                    alt="Silver Emblem"
                    width={96}
                    height={96}
                    priority
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
                    priority
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_gold.png"
                    alt="Gold Emblem"
                    width={96}
                    height={96}
                    priority
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
                    priority
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_bronze.png"
                    alt="Bronze Emblem"
                    width={96}
                    height={96}
                    priority
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
