"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CountUp from "react-countup";

const GiveAwayCounter: React.FC = () => {
  const [amount, setAmount] = useState<number | null>(null);

  // ✅ Fetch current value once on mount
  useEffect(() => {
    const fetchAmount = async () => {
      try {
        const res = await fetch("/api/giveaway-counter");
        if (!res.ok) {
          console.error(`Failed to fetch giveaway counter: ${res.status} ${res.statusText}`);
          setAmount(0); // Set default value on error
          return;
        }
        const data = await res.json();
        setAmount(data.amount);
      } catch (error) {
        console.error("Error fetching giveaway counter:", error);
        setAmount(0); // Set default value on error
      }
    };

    fetchAmount();
  }, []);

  return (
    <div className="mt-12 px-4 text-white">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-6 text-center text-4xl font-bold text-white drop-shadow-md">
          Total Rewards Given Away Since 2024
        </h2>

        <div className="RegisterBlocks-inner flex flex-col items-center justify-center gap-6 rounded-2xl p-6 shadow-[inset_0_1px_4px_rgba(255,255,255,0.05),_0_10px_30px_rgba(128,0,255,0.2)] lg:flex-row">
          {/* Coin */}
          <div className="flex-shrink-0 animate-horizontalBounce">
            <Image
              src="/images/logo/sweetflips_coin.png"
              alt="SweetFlips Coin"
              width={100}
              height={150}
              className="w-25 object-contain"
            />
          </div>

          {/* Count */}
          <div className="flex-1 animate-pulse-glow text-center text-4xl font-extrabold text-white md:text-5xl">
            $
            {amount !== null ? (
              <CountUp
                key={amount}
                end={amount}
                duration={3}
                separator=","
                decimals={2}
                decimal="."
              />
            ) : (
              ""
            )}
          </div>

          {/* Leaderboard */}
          <div className="flex flex-shrink-0 flex-col items-center space-y-2">
            <p className="mb-1 text-base font-semibold text-white md:text-lg">
              Leaderboards
            </p>
            <div className="flex items-center space-x-4">
              <a href="/razed" rel="noopener noreferrer">
                <Image
                  src="/images/logo/Razed icon.jpg"
                  alt="razed"
                  width={50}
                  height={50}
                  className="object-contain transition-transform hover:scale-105"
                />
              </a>
              <a href="/luxdrop" rel="noopener noreferrer">
                <Image
                  src="/images/icon/luxdrop_fav.png"
                  alt="LuxDrop"
                  width={50}
                  height={50}
                  className="object-contain transition-transform hover:scale-105"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveAwayCounter;
