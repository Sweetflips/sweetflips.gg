"use client";
import { Timer } from "@/app/ui/timer/Timer";
import Loader from "@/components/common/Loader";
import Image from "next/image";
import { useEffect, useState } from "react";

const API_PROXY_URL = "/api/CsgowinProxy";

type LeaderboardEntry = {
  username: string;
  wagered: number;
  reward: number;
};

const rewardMapping: { [key: number]: number } = {
  1: 10000,
  2: 5000,
  3: 3250,
  4: 2500,
  5: 1500,
  6: 1000,
  7: 750,
  8: 500,
  9: 300,
  10: 200,
};

const parseWageredAmount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return 0;
  }
  const cleanedValue = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleanedValue);
  return Number.isFinite(parsed) ? parsed : 0;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const rewardFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const CoinIcon = ({ className = "inline-block h-4 w-4", size = 48 }: { className?: string; size?: number }) => (
  <Image
    src="/images/icon/csgowin_coin.webp"
    alt="Coins"
    width={size}
    height={size}
    className={`${className} flex-shrink-0`}
    unoptimized
  />
);

const CsgowinLeaderboard = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);

  const now = new Date();

  const leaderboardTitleAmount = "25,000";
  const leaderboardDescription = "Each month, 25,000 coins are distributed among 10 users based on their total wagered amount on CSGOWIN.";

  const fallbackEndDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await fetch(API_PROXY_URL, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `API request failed with status ${response.status}: ${errorData.message || errorData.error || response.statusText}`,
          );
        }

        const result = await response.json();
        if (result.dateEnd && isMounted) {
          setDateEnd(result.dateEnd);
        }

        const users = Array.isArray(result.data) ? result.data : [];
        const parsedData = users.map(
          (user: any): LeaderboardEntry => ({
            username: user.username,
            wagered: parseWageredAmount(user.wagered),
            reward: 0,
          }),
        );
        const sortedData: LeaderboardEntry[] = parsedData
          .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.wagered - a.wagered)
          .map((user: LeaderboardEntry, index: number) => ({
            ...user,
            reward: rewardMapping[index + 1] || 0,
          }));
        if (isMounted) setData(sortedData);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 300_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const placeholderData: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
    username: "---",
    wagered: 0,
    reward: rewardMapping[i + 1] || 0,
  }));

  const displayData = data.length > 0 ? data : placeholderData;
  const topUsers = displayData.slice(0, 3);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const formatWager = (amount: number) => numberFormatter.format(amount);
  const formatReward = (amount: number) => rewardFormatter.format(amount);

  const restUsers = displayData.slice(3, 10);
  const countDownDateISO = dateEnd || fallbackEndDate.toISOString();

  return (
    <div className="mt-4 p-4 text-white">
      {/* Header Banner */}
      <div className="FooterBg relative mx-auto flex min-h-[20rem] w-full transform flex-col items-center justify-start overflow-hidden rounded-xl p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] transition-all sm:min-h-[22rem] sm:w-3/4 sm:flex-row sm:items-start md:min-h-[20rem] md:w-5/6">
        {/* Left Image - SweetFlips */}
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

        {/* Right Image - CSGOWIN */}
        <div className="hide-on-ipad absolute right-0 top-[30px] hidden pr-4 md:block">
          <Image
            src="/images/logo/csgowin_logo.webp"
            alt="CSGOWIN Logo"
            className="transform"
            width={204}
            height={204}
            priority
          />
        </div>

        {/* Centered Text Section */}
        <div className="relative z-10 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-8">
          <b className="animate-pulse-glow text-2xl leading-tight text-[#fff] sm:text-3xl md:text-4xl lg:text-5xl">
            <span className="inline-flex items-center gap-2 sm:gap-3"><CoinIcon className="inline-block h-7 w-7 sm:h-9 sm:w-9 md:h-11 md:w-11" /> {leaderboardTitleAmount}</span> CSGOWIN X SWEETFLIPS LEADERBOARD
          </b>

          <p className="mx-auto mt-3 max-w-4xl text-center text-sm leading-relaxed text-white sm:text-base md:text-lg lg:text-xl">
            {leaderboardDescription}
          </p>

          {/* Mobile logos */}
          <div className="mt-4 flex items-end justify-center gap-5 md:hidden">
            <Image
              src="/images/logo/sweet_flips_emblem_gold.png"
              alt="SweetFlips Gold Emblem"
              className="h-[64px] w-auto"
              width={272}
              height={408}
            />
            <Image
              src="/images/logo/csgowin_logo.webp"
              alt="CSGOWIN Logo"
              className="h-[58px] w-auto"
              width={204}
              height={204}
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

      {/* Top 3 Users */}
      <div className="TopLeaderboard">
        {topUsers && topUsers.length >= 3 && (
          <>
            {/* Left Card - 2nd Place */}
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
                    <CoinIcon /> {formatWager(topUsers[1].wagered)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: <CoinIcon className="inline-block h-5 w-5" /> {formatReward(topUsers[1].reward!)}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Card - 1st Place */}
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
                    <CoinIcon /> {formatWager(topUsers[0].wagered)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: <CoinIcon className="inline-block h-5 w-5" /> {formatReward(topUsers[0].reward!)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card - 3rd Place */}
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
                    <CoinIcon /> {formatWager(topUsers[2].wagered)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: <CoinIcon className="inline-block h-5 w-5" /> {formatReward(topUsers[2].reward!)}
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
                  <div className="px-3 py-2 font-bold">{user.username}</div>
                  <div className="flex items-center justify-center gap-1 px-3 py-2">
                    <CoinIcon /> {formatWager(user.wagered)}
                  </div>
                  <div className="flex items-center justify-center gap-1 px-3 py-2 text-[#FFD700]">
                    <CoinIcon /> {formatReward(user.reward!)}
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

export default CsgowinLeaderboard;
