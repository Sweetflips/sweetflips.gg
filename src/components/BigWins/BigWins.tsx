"use client";
import Image from "next/image";
import React from "react";
import CountUp from "react-countup";

const bigWins = [
  { game: "Towers", name: "Denny", amount: 1846757.32 },
  { game: "SIXSIXSIX", name: "Denny, Des & Nick", amount: 176435.0 },
  { game: "Juicy Fruits", name: "Peter", amount: 96724.72 },
  { game: "Bonanza", name: "Peter", amount: 95605.0 },
  { game: "Plinko", name: "Amor", amount: 76315.0 },
];

const BigWins: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bigWins.map((win, index) => (
          <div
            key={index}
            className="rounded-xl p-5 bg-[radial-gradient(at_top_center,_#350c4a_0%,_#130C1A_60%)] border border-graydark shadow-card transform transition-transform hover:scale-[1.03] hover:shadow-xl"
          >
            <div className="mb-3 flex items-center justify-center gap-3">
              <Image
                className="rounded"
                width={40}
                height={40}
                src="/images/logo/sj8aDvAg_400x400.jpg"
                alt="Razed"
                priority
              />
              <h3 className="text-xl font-semibold text-white">{win.game}</h3>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-xl font-semibold text-white">{win.name}</span>
              <span className="mt-2 text-2xl font-bold text-green-400">
                $<CountUp end={win.amount} duration={5} separator="," decimals={2} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BigWins;
