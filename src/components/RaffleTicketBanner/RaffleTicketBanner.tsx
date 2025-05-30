"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const RaffleTicketBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date("2025-05-26T00:00:00Z").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft("00d 00h 00m 00s");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-12 px-4 text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl p-6 shadow-[inset_0_1px_4px_rgba(255,255,255,0.05),_0_10px_30px_rgba(128,0,255,0.2)] lg:flex-row lg:justify-between lg:items-center">

          {/* Left: Title + Button */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:ml-[20%]">
            <h2 className="text-3xl sm:text-4xl font-bold">
              <b className="text-[#9925FE]">$2000</b> Weekly Raffle
            </h2>

            <a href="/raffle-info" className="mt-3 lg:ml-[20%]">
              <div className="rounded-xl bg-[#9925FE] hover:opacity-90">
                <button className="flex items-center px-4 py-2 text-[#dee4ee]">
                  <Image
                    src="/images/logo/sweetflips_coin.png"
                    alt="Sweetflips coin"
                    width={30}
                    height={30}
                    className="object-contain mr-2"
                  />
                  <span className="text-lg font-bold">Learn More</span>
                </button>
              </div>
            </a>
          </div>

          {/* Right: Countdown Timer */}
          <div className="mt-4 lg:mt-0 lg:mr-[20%]">
            <div className="bg-[#2B0B3F] px-5 py-3 rounded-lg border border-[#9925FE] shadow-md text-center text-xl font-extrabold text-[#dee4ee]">
             <span className="text-[#9925FE]">{timeLeft}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RaffleTicketBanner;
