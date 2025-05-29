"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CountUp from "react-countup";

const GiveAwayCounter: React.FC = () => {
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const fetchAmount = async () => {
      const res = await fetch("/api/giveaway-counter");
      const data = await res.json();
      setAmount(data.amount);
    };

    fetchAmount();
  }, []);

  return (
    <div className="mt-12 px-4 text-white">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-6 text-center text-4xl font-bold drop-shadow-md text-white">
        Sweetflips Total Giveaway Amount
        </h2>

        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl RegisterBlocks-inner p-6 shadow-[inset_0_1px_4px_rgba(255,255,255,0.05),_0_10px_30px_rgba(128,0,255,0.2)] lg:flex-row">
          <div className="flex-shrink-0 animate-horizontalBounce">
            <Image
              src="/images/logo/sweetflips_coin.png"
              alt="Sweetflips Coin"
              width={100}
              height={150}
              className="object-contain w-25"
            />
          </div>

          <div className="flex-1 text-center text-4xl md:text-5xl font-extrabold text-white animate-pulse-glow">
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

          <div className="flex-shrink-0 flex flex-col items-center space-y-2">
            <p className="text-base md:text-lg text-white font-semibold mb-1">Leaderboards</p>
            <div className="flex items-center space-x-4">
              <a href="/razed" rel="noopener noreferrer">
                <Image
                  src="/images/icon/Razed_icon.png"
                  alt="razed"
                  width={50}
                  height={50}
                  className="object-contain hover:scale-105 transition-transform"
                />
              </a>
              <a href="/empiredrop" rel="noopener noreferrer">
                <Image
                  src="/images/icon/EmpireDrop_Fav_Text.png"
                  alt="EmpireDrop"
                  width={50}
                  height={50}
                  className="object-contain hover:scale-105 transition-transform"
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