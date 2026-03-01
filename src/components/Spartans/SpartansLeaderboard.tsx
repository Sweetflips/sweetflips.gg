"use client";
import { Timer } from "@/app/ui/timer/Timer";
import Loader from "@/components/common/Loader";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const API_PROXY_URL = "/api/SpartansProxy";

type LeaderboardEntry = {
  username: string;
  wagered: number;
  reward: number;
};

// Define the monthly reward mapping for $75,000 total prize pool
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

const SpartansLeaderboard = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fireworksLaunched = useRef(false); // Prevent multiple launches
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  const togglePopup = () => setIsPopupOpen((prevState) => !prevState);

  const maskUsername = (username: string) => {
    const len = username.length;
    if (len <= 2) return username;
    if (len <= 4) return username[0] + "*".repeat(len - 2) + username[len - 1];
    return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await fetch(API_PROXY_URL, {
          method: "GET",
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API request failed with status ${response.status}: ${errorData.message || errorData.error || response.statusText}`);
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
    // Refresh leaderboard every 5 minutes (same as Luxdrop)
    const interval = setInterval(fetchData, 900_000); // 15 min, matches Spartans source
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentRewardMapping]);

  const topUsers = data.slice(0, 3);

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
      minimumFractionDigits: 0,
    }).format(amount);
    return formattedAmount.endsWith(".00")
      ? formattedAmount.slice(0, -3)
      : formattedAmount;
  };

  // Determine the number of users to display based on the event
  const displayLimit = isSpecialWeekActive ? 20 : 25;
  const restUsers = data.slice(3, displayLimit);

  const countDownDateISO = targetDateForTimer.toISOString();

  return (
    <div className="mt-4 p-4 text-white">
      {/* Floating Image */}
      <div className="FooterBg relative mx-auto flex min-h-[20rem] w-full transform flex-col items-center justify-start overflow-hidden rounded-xl p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] transition-all sm:min-h-[22rem] sm:w-3/4 sm:flex-row sm:items-start md:min-h-[20rem] md:w-5/6">
        {/* Left Image - Temporary decorative image */}
        <div className="hide-on-ipad absolute left-0 hidden md:block">
          <Image
            src="/images/logo/sweet_flips_emblem_gold.png"
            alt="SweetFlips Gold Emblem"
            className="transform"
            width={272}
            height={408}
            priority
          />
        </div>

        {/* Right Image - Temporary decorative image */}
        <div className="hide-on-ipad absolute right-0 top-[30px] hidden pr-4 md:block">
          <Image
            src="/images/logo/Spartans-icon.svg"
            alt="Spartans Logo"
            className="transform"
            width={204}
            height={306}
            priority
          />
        </div>
        {/* Centered Text Section */}
        <div className="relative z-10 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-8">
          {/* Prize Pool Text */}
          <b className="animate-pulse-glow text-2xl leading-tight text-[#fff] sm:text-3xl md:text-4xl lg:text-5xl">
            {leaderboardTitle}
          </b>

          {/* Description Text */}
          <p className="mx-auto mt-3 max-w-4xl text-center text-sm leading-relaxed text-white sm:text-base md:text-lg lg:text-xl">
            {leaderboardDescription}
          </p>

          {/* Bottom logos on mobile */}
          <div className="mt-4 flex items-end justify-center gap-5 md:hidden">
            <Image
              src="/images/logo/sweet_flips_emblem_gold.png"
              alt="SweetFlips Gold Emblem"
              className="h-[64px] w-auto"
              width={272}
              height={408}
            />
            <Image
              src="/images/logo/Spartans-icon.svg"
              alt="Spartans Logo"
              className="h-[58px] w-auto"
              width={204}
              height={306}
            />
          </div>
        </div>
      </div>
      <div className="mb-4 mt-8 flex flex-col items-center text-2xl font-bold">
        Leaderboard ends in
      </div>
      <div className="relative mb-15 flex justify-center space-x-4">
        {countDownDateISO && (
          <div
            className="mx-12 flex flex-col items-center rounded-3xl md:mx-80"
            data-aos="fade-up"
          >
            <Timer type="normal" date={countDownDateISO} />
          </div>
        )}
      </div>

      {/* Top 3 Users (Responsive with Badge) */}
      <div className="TopLeaderboard">
        {topUsers && topUsers.length >= 3 && (
          <>
            {/* Left Card */}
            <div className="TopLeaderboard__card TopLeaderboard__card--left border border-purple-700 shadow-lg shadow-purple-900/50 duration-200 ease-in hover:scale-110 md:mt-10">
              <div className="TopLeaderboard__card-inner">
                <div className="TopLeaderboard__number-wrapper">
                  <Image
                    src="/images/icon/Second_Place.png"
                    alt="Second Place"
                    className="h-8 w-8"
                    width={32}
                    height={32}
                    priority
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_silver.png"
                    alt="SweetFlips Emblem Silver"
                    className="h-24 w-24"
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

            {/* Middle Card */}
            <div className="TopLeaderboard__card TopLeaderboard__card--middle border border-purple-700 shadow-lg shadow-purple-900/50 duration-200 ease-in hover:scale-110">
              <div className="TopLeaderboard__card-inner">
                <div className="TopLeaderboard__number-wrapper">
                  <Image
                    src="/images/icon/First_Place.png"
                    alt="First Place"
                    className="h-8 w-8"
                    width={32}
                    height={32}
                    priority
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_gold.png"
                    alt="SweetFlips Emblem Gold"
                    className="h-24 w-24"
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

            {/* Right Card */}
            <div className="TopLeaderboard__card TopLeaderboard__card--right border border-purple-700 shadow-lg shadow-purple-900/50 duration-200 ease-in hover:scale-110 md:mt-10">
              <div className="TopLeaderboard__card-inner">
                <div className="TopLeaderboard__number-wrapper">
                  <Image
                    src="/images/icon/Third_Place.png"
                    alt="Third Place"
                    className="h-8 w-8"
                    width={32}
                    height={32}
                    priority
                  />
                </div>
                <div className="TopLeaderboard__card-image">
                  <Image
                    src="/images/logo/sweet_flips_emblem_bronze.png"
                    alt="SweetFlips Emblem Bronze"
                    className="h-24 w-24"
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

      {/* Main Table */}
      <div className="flex items-center justify-center overflow-x-auto">
        <div className="w-full md:w-10/12 lg:w-8/12 xl:w-7/12">
          {/* Table Header (Only visible on larger screens) */}
          <div className="mx-auto max-w-[1000px]">
            {" "}
            {/* This is the new wrapper */}
            <div className="bg-gray-800 hidden grid-cols-4 rounded-lg text-center font-bold sm:grid">
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
                  <div className="hidden px-3 py-2 font-bold sm:block">
                    {index + 4}
                  </div>
                  <div className="px-3 py-2 font-bold">{user.username}</div>
                  <div className="px-3 py-2">
                    {formatCurrency(user.wagered)}
                  </div>
                  <div className="text-red-400 px-3 py-2">
                    {" "}
                    {formatRewardCurrency(user.reward!)}
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

export default SpartansLeaderboard;
