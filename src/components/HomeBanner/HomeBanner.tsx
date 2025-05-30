import React from "react";

const HomeBanner: React.FC = () => {
  return (
    <div
      className="md:w-1/1 mx-auto flex h-1/8 transform items-center justify-center rounded-xl text-center transition-all sm:w-3/4"
    >
      <div className="my-auto flex w-full max-w-180 flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
          Welcome to Sweetflips
        </h1>
        <p className="mt-6 text-lg font-bold text-white sm:text-xl">
          Receive <b className="text-[rgb(223,86,255)]">Rewards</b> &amp;{" "}
          <b className="text-[rgb(223,86,255)]">Special</b> Bonuses
        </p><br />
        <p className="text-sm text-white sm:text-base">
          Unlock and claim exclusive bonuses on{" "}
          <b className="text-[rgb(223,86,255)]">
            <a href="https://www.razed.com/signup/?raf=SweetFlips" target="blank">
              Razed.com
            </a>
          </b>{" "}
          - the world&apos;s most known and trusted online casino. From VIP
          perks to leaderboard races, milestones, events and daily giveaways, we&apos;ve got it
          all.
        </p>
      </div>
    </div>
  );
};

export default HomeBanner;
