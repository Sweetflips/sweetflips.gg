"use client";
import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import Loader from "@/components/common/Loader";
import { Timer } from "@/app/ui/timer/Timer";
import Footer from "@/components/Footer/Footer";
import { DateTime } from "luxon";
import Image from "next/image";

const API_PROXY_URL = "/api/LuxDropProxy";

interface User {
  username: string;
  wagerAmount: number;
  rewardAmount?: number;
}

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

const LuxDropLeaderboard: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [countdownDate, setCountdownDate] = useState<string>("");

  const fireworksLaunched = useRef(false); 

  const maskUsername = (username: string) => {
    const len = username.length;

    if (len <= 2) {
      return username; 
    }

    if (len <= 4) {
      return username[0] + "*".repeat(len - 2) + username[len - 1];
    }

    return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_PROXY_URL);
        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setCountdownDate(result.dates.beforeDate);

        const mappedData: User[] = result.ranking.map((entry: any) => ({
          username: entry.user.name,
          wagerAmount: entry.total,
          rewardAmount: 0,
        }));

        const sortedData = mappedData.sort(
          (a: User, b: User) => b.wagerAmount - a.wagerAmount,
        );

        const leaderboardWithRewards = sortedData.map(
          (user: User, index: number) => {
            const rank = index + 1;
            user.rewardAmount = rewardMapping[rank] || 0;
            user.username = maskUsername(user.username);
            return user;
          },
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

  useEffect(() => {
    if (data.length > 0 && !fireworksLaunched.current) {
      const topUsers = data.slice(0, 3);
      if (topUsers[0]) {
        fireworksLaunched.current = true;
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.6 },
        });
      }
    }
  }, [data]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const topUsers = data.slice(0, 3);

  const restUsers = data.slice(3, 20);
  
  // Fixed countdown to August 31, 2024
  const countDownDate = DateTime.fromObject({
    year: 2024,
    month: 8,
    day: 31,
    hour: 23,
    minute: 59,
    second: 59,
  }).setZone("Europe/Amsterdam").toISO();

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
      <div className="FooterBg relative mx-auto flex h-80 w-full transform flex-col items-center justify-between overflow-hidden rounded-xl p-4 transition-all sm:w-3/4 sm:flex-row sm:items-start md:w-5/6">
        {/* Left Image */}
        <div className="hide-on-ipad absolute left-0 hidden sm:block">
          <Image
            src="/images/cover/Character Box Dior.png"
            alt="LuxDrop Box"
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

        <div className="absolute left-0 right-0 mx-auto mt-6 max-w-screen-lg px-4 text-center md:mt-10">
          <b className="text-4xl text-white sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl">
            $20,000
          </b>
          <div className="mt-4 flex flex-col items-center justify-center sm:flex-row sm:space-x-4">
            <div className="mb-3 transition-all duration-300 sm:mb-0 sm:w-[150px] md:w-[200px] lg:w-[300px] xl:w-[250px]">
              <div className="text-6xl font-bold text-purple-400">LuxDrop</div>
            </div>
            <b className="text-4xl text-white sm:text-2xl md:text-3xl lg:mt-4 lg:text-3xl">
              Leaderboard
            </b>
          </div>
          <p className="m-4 mx-auto text-center text-white sm:m-6 sm:text-xl md:text-2xl lg:m-8 lg:text-3xl xl:text-xl">
            A total of $20,000 is distributed across 20 users based on<br></br>
            their total wagered amount from July 28th to August 31st.
          </p>
        </div>
      </div>
      <div className="mb-4 mt-12 flex flex-col items-center text-2xl font-bold">
        Leaderboard ended on August 31st, 2024
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
      <div className="TopLeaderboard">
        {topUsers && topUsers.length >= 3 && (
          <>
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
                    {formatCurrency(topUsers[1].wagerAmount)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[1].rewardAmount!)}
                  </p>
                </div>
              </div>
            </div>
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
                    {formatCurrency(topUsers[0].wagerAmount)}
                  </p>
                  <p className="TopLeaderboard__prize">
                    Prize: {formatRewardCurrency(topUsers[0].rewardAmount!)}
                  </p>
                </div>
              </div>
            </div>
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
        <div className="w-full sm:w-6/12">
          <div className="bg-gray-800 hidden grid-cols-4 rounded-lg p-2 text-center font-bold sm:grid">
            <div className="px-4 py-2">Rank</div>
            <div className="px-4 py-2">Name</div>
            <div className="px-4 py-2">Wager</div>
            <div className="px-4 py-2">Reward</div>
          </div>

          <div>
            {restUsers.map((user, index) => (
              <div
                key={index}
                className="Leaderboard__card relative my-2 rounded-lg p-1 shadow-lg md:my-4"
              >
                <div className="Leaderboard__card-inner grid grid-cols-3 gap-4 text-center sm:grid-cols-4">
                  <div className="hidden py-2 font-bold sm:block">
                    {index + 4}
                  </div>
                  <div className="py-2 font-bold">{user.username}</div>
                  <div className="py-2">{formatCurrency(user.wagerAmount)}</div>
                  <div className="text-red-400 px-4 py-2">
                    {formatRewardCurrency(user.rewardAmount!)}
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

export default LuxDropLeaderboard;