/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CountUp from "react-countup";
import Link from "next/link";

const LeaderboardLinkIcon = ({
  href,
  src,
  alt,
}: {
  href: string;
  src: string;
  alt: string;
}) => (
  <Link href={href} className="group">
    <div className="relative h-[50px] w-[50px]">
      <img
        src={src}
        alt={alt}
        width={50}
        height={50}
        className="relative z-10 h-[50px] w-[50px] object-contain transition-transform hover:scale-105"
        decoding="async"
      />
      <img
        src={src}
        alt=""
        width={50}
        height={50}
        aria-hidden="true"
        className="absolute left-0 top-0 z-0 h-[50px] w-[50px] object-contain opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-40"
        decoding="async"
      />
    </div>
  </Link>
);

const GiveAwayCounter = () => {
  const [amount, setAmount] = useState<number | null>(null);

  // ✅ Fetch current value once on mount
  useEffect(() => {
    const controller = new AbortController();

    const fetchAmount = async () => {
      try {
        const res = await fetch("/api/giveaway-counter", { signal: controller.signal });
        if (!res.ok) {
          console.error(`Failed to fetch giveaway counter: ${res.status} ${res.statusText}`);
          setAmount(0); // Set default value on error
          return;
        }
        const data = await res.json();
        setAmount(data.amount);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching giveaway counter:", error);
        setAmount(0); // Set default value on error
      }
    };

    void fetchAmount();

    return () => {
      controller.abort();
    };
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
              <LeaderboardLinkIcon
                href="/spartans"
                src="/images/logo/Spartans-icon.svg"
                alt="Spartans"
              />
              <LeaderboardLinkIcon
                href="/luxdrop"
                src="/images/icon/luxdrop_fav.png"
                alt="LuxDrop"
              />
              <LeaderboardLinkIcon
                href="/csgowin"
                src="/images/logo/csgowin_logo.webp"
                alt="CSGOWIN"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveAwayCounter;
