"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BannerVideo from "@/components/BannerVideo/BannerVideo";
import HomeBanner from "@/components/HomeBanner/HomeBanner";
import RegisterBlocks from "@/components/RegisterBlocks/RegisterBlocks";
import Image from "next/image";
import GiveAwayCounter from "../GiveAwayCounter/GiveAwayCounter";
import { Timer } from "@/app/ui/timer/Timer";
import Loader from "@/components/common/Loader";

const API_PROXY_URL = "/api/SpartansProxy";

type LeaderboardEntry = {
  username: string;
  wagered: number;
  reward: number;
};

// Define the reward mapping based on rank - UPDATED TO MATCH SPARTANS PAGE
const monthlyRewardMapping: { [key: number]: number } = {
  1: 30000,
  2: 15000,
  3: 10000,
  4: 6000,
  5: 2200,
  6: 1500,
  7: 1250,
  8: 1000,
  9: 900,
  10: 850,
  11: 780,
  12: 730,
  13: 670,
  14: 620,
  15: 520,
  16: 470,
  17: 420,
  18: 370,
  19: 345,
  20: 295,
  21: 270,
  22: 245,
  23: 220,
  24: 170,
  25: 165,
};

const Homepage = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const fireworksLaunched = useRef(false); // Prevent multiple launches

  // --- Date Logic ---
  const now = new Date(); // Current date in UTC

  // No special period active -- standard monthly leaderboard
  const isSpecialWeekActive = false;

  const prizePoolAmount = 75000;
  const leaderboardTitle = `$75,000 SPARTANS X SWEETFLIPS LEADERBOARD`;
  const leaderboardDescription = `Each month, $75,000 is distributed among 25 users based on their total wagered amount on Spartans.`;
  const currentRewardMapping = monthlyRewardMapping;
  const targetDateForTimer = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );
  // --- End Date Logic ---

  const maskUsername = (username: string) => {
    const len = username.length;
    if (len <= 2) return username;
    if (len <= 4) return username[0] + "*".repeat(len - 2) + username[len - 1];
    return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
  };

  useEffect(() => {
    let isMounted = true;
    let isInitialLoad = true;
    const fetchData = async () => {
      if (isInitialLoad) {
        setLoading(true);
        isInitialLoad = false;
      }
      setError(null);
      try {
        const response = await fetch(API_PROXY_URL, {
          method: "GET",
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API request failed with status ${response.status}: ${errorData.message || response.statusText}`);
        }
        const result = await response.json();
        if (!Array.isArray(result.data)) {
          throw new Error("Invalid data format: expected 'data' array");
        }
        const parsedData = result.data.map(
          (user: any): LeaderboardEntry => ({
            username: maskUsername(user.username),
            wagered: parseFloat(user.wagered),
            reward: 0,
          }),
        );
        const sortedData: LeaderboardEntry[] = parsedData
          .sort(
            (a: LeaderboardEntry, b: LeaderboardEntry) => b.wagered - a.wagered,
          )
          .map((user: LeaderboardEntry, index: number) => ({
            ...user,
            reward: currentRewardMapping[index + 1] || 0,
          }));
        if (isMounted) setData(sortedData);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 300_000); // 5 min, fresher wager data
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentRewardMapping]);

  const topUsers = data.slice(0, 3);

  // Handle URL parameters for error/success messages
  useEffect(() => {
    if (!searchParams) return;

    const error = searchParams.get('error');
    const linked = searchParams.get('linked');

    if (error) {
      setUrlError(decodeURIComponent(error));
      // Clean up URL after showing error
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }

    if (linked === 'success') {
      setSuccessMessage('Kick account successfully linked!');
      // Clean up URL after showing success
      const url = new URL(window.location.href);
      url.searchParams.delete('linked');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

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

  // Determine the number of users to display based on the event
  const displayLimit = isSpecialWeekActive ? 20 : 25;
  const restUsers = data.slice(3, displayLimit); // Displays users from rank 4 up to displayLimit
  const countDownDateISO = targetDateForTimer.toISOString();

  return (
    <>
      {/* Error Message Display */}
      {urlError && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-800 dark:text-red-200 font-medium">
              {urlError}
            </span>
            <button
              onClick={() => setUrlError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Success Message Display */}
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-green-800 dark:text-green-200 font-medium">
              {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="grid h-auto grid-cols-1 rounded-2xl">
        <div className="col-span-12 xl:col-span-8">
          <BannerVideo />
          <HomeBanner />
          <RegisterBlocks />
          <GiveAwayCounter />
          {/* Spartans Leaderboard Section START */}
          <div className="mt-4 p-4 text-white">
            {" "}
            {/* Adapted from SpartansLeaderboard's main div */}
            {/* Floating Images - Temporary decorative images */}
            {/* Header section - Copied from SpartansLeaderboard */}
            <div className="FooterBg relative mx-auto flex h-80 w-full transform flex-col items-center justify-between overflow-hidden rounded-xl p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] transition-all sm:w-3/4 sm:flex-row sm:items-start md:w-5/6">
              {/* Temporary decorative images - will replace later */}
              <div className="hide-on-ipad absolute left-0 hidden sm:block">
                <Image
                  src="/images/logo/sweet_flips_emblem_gold.png"
                  alt="SweetFlips Gold Emblem"
                  className="transform"
                  width={272}
                  height={408}
                  priority
                />
              </div>
              <div className="hide-on-ipad absolute right-0 top-[30px] hidden pr-4 sm:block">
                <Image
                  src="/images/logo/Spartans-icon.svg"
                  alt="Spartans Logo"
                  className="transform"
                  width={204}
                  height={306}
                  priority
                />
              </div>
              <div className="absolute -left-1 top-[-20px] sm:block md:hidden">
                <Image
                  src="/images/logo/sweet_flips_emblem_gold.png"
                  alt="SweetFlips Gold Emblem"
                  className="h-[103px] w-[68.05px] transform"
                  width={68.05}
                  height={103}
                  priority
                />
              </div>
              <div className="absolute -right-5 top-[250px] pr-2 sm:block md:hidden">
                <Image
                  src="/images/logo/Spartans-icon.svg"
                  alt="Spartans Logo"
                  className="h-[77.25px] w-[51.0375px] transform"
                  width={51.0375}
                  height={77.25}
                  priority
                />
              </div>
              <div className="absolute left-0 right-0 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-10">
                <b className="animate-pulse-glow text-5xl text-[#fff] sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl">
                  {leaderboardTitle}
                </b>
                <div className="mt-4 flex flex-col items-end justify-center sm:flex-row sm:items-end sm:space-x-4">
                  <Image
                    src="/images/logo/Spartans wordmark.webp"
                    alt="Spartans Logo"
                    className="mb-3 transition-all duration-300 sm:mb-0 sm:w-[150px] md:w-[200px] lg:w-[250px] xl:w-[250px]"
                    style={{ filter: 'grayscale(1)' }}
                    width={200}
                    height={100}
                    sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, 250px"
                    priority
                  />
                  <b className="text-4xl text-white sm:text-2xl md:text-3xl lg:text-3xl">
                    Leaderboard
                  </b>
                </div>
                <p className="mx-auto mt-4 text-center leading-relaxed text-white sm:text-xl md:mt-0 md:text-2xl lg:m-4 lg:text-3xl xl:text-xl">
                  {leaderboardDescription}
                </p>
              </div>
            </div>
            {/* Timer Section - Copied from SpartansLeaderboard */}
            <div className="mb-4 mt-8 flex flex-col items-center text-2xl font-bold">
              Leaderboard ends in
            </div>
            <div className="relative mb-15 flex justify-center space-x-4">
              {loading && <Loader />}
              {error && <p className="text-red-500">Error: {error}</p>}
              {!loading && !error && countDownDateISO && (
                <div
                  className="mx-12 flex flex-col items-center rounded-3xl md:mx-80"
                  data-aos="fade-up" // Assuming AOS is initialized globally if this is to work
                >
                  <Timer type="normal" date={countDownDateISO} />
                </div>
              )}
            </div>
            {/* Leaderboard Display - Copied and adapted from SpartansLeaderboard */}
            {!loading && !error && data.length > 0 && (
              <>
                {/* Top 3 Users */}
                <div className="TopLeaderboard">
                  {topUsers && topUsers.length >= 3 && (
                    <>
                      {/* Left Card (2nd Place) */}
                      <div className="TopLeaderboard__card TopLeaderboard__card--left border border-purple-700 shadow-lg shadow-purple-900/50 duration-200 ease-in hover:scale-110 md:mt-10">
                        <div className="TopLeaderboard__card-inner">
                          <div className="TopLeaderboard__number-wrapper">
                            <Image
                              src="/images/icon/Second_Place.png"
                              alt="Second Place"
                              width={32}
                              height={32}
                              priority
                            />
                          </div>
                          <div className="TopLeaderboard__card-image">
                            <Image
                              src="/images/logo/sweet_flips_emblem_silver.png"
                              alt="SweetFlips Emblem Silver"
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
                              Prize: {formatRewardCurrency(topUsers[1].reward!)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Middle Card (1st Place) */}
                      <div className="TopLeaderboard__card TopLeaderboard__card--middle border border-purple-700 shadow-lg shadow-purple-900/50 duration-200 ease-in hover:scale-110">
                        <div className="TopLeaderboard__card-inner">
                          <div className="TopLeaderboard__number-wrapper">
                            <Image
                              src="/images/icon/First_Place.png"
                              alt="First Place"
                              width={32}
                              height={32}
                              priority
                            />
                          </div>
                          <div className="TopLeaderboard__card-image">
                            <Image
                              src="/images/logo/sweet_flips_emblem_gold.png"
                              alt="SweetFlips Emblem Gold"
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
                              Prize: {formatRewardCurrency(topUsers[0].reward!)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Right Card (3rd Place) */}
                      <div className="TopLeaderboard__card TopLeaderboard__card--right border border-purple-700 shadow-lg shadow-purple-900/50 duration-200 ease-in hover:scale-110 md:mt-10">
                        <div className="TopLeaderboard__card-inner">
                          <div className="TopLeaderboard__number-wrapper">
                            <Image
                              src="/images/icon/Third_Place.png"
                              alt="Third Place"
                              width={32}
                              height={32}
                              priority
                            />
                          </div>
                          <div className="TopLeaderboard__card-image">
                            <Image
                              src="/images/logo/sweet_flips_emblem_bronze.png"
                              alt="SweetFlips Emblem Bronze"
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
                              Prize: {formatRewardCurrency(topUsers[2].reward!)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Rest of the Users Table */}
                {restUsers.length > 0 && (
                  <div className="mt-8 flex items-center justify-center overflow-x-auto">
                    <div className="w-full md:w-10/12 lg:w-8/12 xl:w-7/12">
                      <div className="mx-auto max-w-[1000px]">
                        <div className="bg-gray-800 hidden grid-cols-4 rounded-lg text-center font-bold sm:grid">
                          <div className="px-3 py-2">Rank</div>
                          <div className="px-3 py-2">Name</div>
                          <div className="px-3 py-2">Wager</div>
                          <div className="px-3 py-2">Reward</div>
                        </div>
                      </div>
                      <div>
                        {restUsers.map((user, index) => (
                          <div
                            key={index}
                            className="Leaderboard__card relative my-2 rounded-lg p-1 shadow-lg md:my-4"
                          >
                            <div className="Leaderboard__card-inner grid grid-cols-3 text-center sm:grid-cols-4">
                              <div className="hidden px-3 py-2 font-bold sm:block">
                                {index + 4}
                              </div>
                              <div className="px-3 py-2 font-bold">
                                {user.username}
                              </div>
                              <div className="px-3 py-2">
                                {formatCurrency(user.wagered)}
                              </div>
                              <div className="text-red-400 px-3 py-2">
                                {formatRewardCurrency(user.reward!)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {!loading && !error && data.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-xl">
                  Leaderboard data is currently unavailable or empty.
                </p>
              </div>
            )}
          </div>
          {/* Spartans Leaderboard Section END */}
        </div>
      </div>
    </>
  );
};

export default Homepage;
