"use client";
import React, { useEffect, useState, useRef } from "react";
import Loader from "@/components/common/Loader";
import { Timer } from "@/app/ui/timer/Timer";
import { DateTime } from "luxon";
import Image from "next/image";

const API_PROXY_URL = "/api/RazedProxy";

type LeaderboardEntry = {
  username: string;
  referred_by_code?: string;
  wagered: number;
  reward: number;
};

const rewardMapping: { [key: number]: number } = {
  1: 15000,
  2: 8000,
  3: 5000,
};

const TopLeaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const fireworksLaunched = useRef(false);

  const togglePopup = () => {
    setIsPopupOpen((prevState) => !prevState);
  };

  const maskUsername = (username: string) => {
    if (username.length <= 4) return username;
    return (
      username.slice(0, 2) +
      '*'.repeat(username.length - 4) +
      username.slice(-2)
    );
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
          referred_by_code: user.referred_by_code,
          wagered: parseFloat(user.wagered),
          reward: 0,
        }));
  
        const sortedData: LeaderboardEntry[] = parsedData
          .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.wagered - a.wagered)
          .map((user: LeaderboardEntry, index: number): LeaderboardEntry => ({
            ...user,
            reward: rewardMapping[index + 1] || 0,
          }));
  
        setData(sortedData);
      } catch (err: any) {
        setError(err.message);
      }
    };
  
    fetchData();
  }, []);
  

  const topUsers = data.slice(0, 3);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      let targetDate: Date;

      if (now.getDate() < 24) {
        targetDate = new Date(currentYear, currentMonth - 1, 23);
      } else {
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextMonthYear =
          currentMonth === 12 ? currentYear + 1 : currentYear;
        targetDate = new Date(nextMonthYear, nextMonth - 1, 23);
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
  const countDownDate = (() => {
    const now = DateTime.now().setZone("Europe/Amsterdam");
    const currentMonth = now.month;
    const currentYear = now.year;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  
    let targetDate;
    if (now.day < 23) {
      targetDate = DateTime.fromObject({ year: currentYear, month: currentMonth, day: 23 }).setZone("Europe/Amsterdam");
    } else {
      targetDate = DateTime.fromObject({ year: currentYear, month: nextMonth, day: 23 }).setZone("Europe/Amsterdam");
    }
  
    return targetDate.toISO();
  })();

  return (
    <div className="mt-6 text-white md:mt-12">
      <p className="mb-10 flex-col text-center text-2xl font-bold md:mt-12">
        <b className="text-[#4D4EE0]">Razed</b> Top Leaderboard
      </p>
      <div className="TopLeaderboard">
        {topUsers && topUsers.length >= 3 && (
          <>
            <div className="TopLeaderboard__card TopLeaderboard__card--left duration-200 ease-in hover:scale-110 md:mt-10">
              <a href="/razed">
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
                      Prize: {formatRewardCurrency(topUsers[1].reward)}
                    </p>
                  </div>
                </div>
              </a>
            </div>

            <div className="TopLeaderboard__card TopLeaderboard__card--middle duration-200 ease-in hover:scale-110">
              <a href="/razed">
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
                      Prize: {formatRewardCurrency(topUsers[0].reward)}
                    </p>
                  </div>
                </div>
              </a>
            </div>

            <div className="TopLeaderboard__card TopLeaderboard__card--right duration-200 ease-in hover:scale-110 md:mt-10">
              <a href="/razed">
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
                      Prize: {formatRewardCurrency(topUsers[2].reward)}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </>
        )}
      </div>

      <div className="mb-4 mt-12 flex flex-col items-center text-2xl font-bold">
        Leaderboard ends in
      </div>
      <div className="relative flex justify-center space-x-4">
        {countDownDate && (
          <div
            className="mx-12 flex flex-col items-center rounded-3xl md:mx-80"
            data-aos="fade-up"
          >
            <Timer type="normal" date={countDownDate} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopLeaderboard;