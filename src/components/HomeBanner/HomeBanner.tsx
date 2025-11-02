import React from "react";

const HomeBanner: React.FC = () => {
  const razedReferralCode = process.env.NEXT_PUBLIC_RAZED_REFERRAL_CODE || "SweetFlips";
  const luxdropAffiliateCode = process.env.NEXT_PUBLIC_LUXDROP_AFFILIATE_CODE || "sweetflips";
  const razedUrl = `https://www.razed.com/signup/?raf=${encodeURIComponent(razedReferralCode)}`;
  const luxdropUrl = `https://luxdrop.com/?r=${encodeURIComponent(luxdropAffiliateCode)}`;

  return (
    <div
      className="md:w-1/1 mx-auto flex h-1/8 transform items-center justify-center rounded-xl text-center transition-all sm:w-3/4"
    >
      <div className="my-auto flex w-full max-w-180 flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
          Welcome to Sweetflips
        </h1>
        <p className="mt-6 text-lg font-bold text-white sm:text-xl">
          Receive <b className="text-blue-400">Rewards</b> &amp;{" "}
          <b className="text-blue-400">Special</b> Bonuses
        </p><br />
        <p className="text-sm text-white sm:text-base">
          Unlock and claim exclusive bonuses on{" "}
          <a
            href={razedUrl}
            target="blank"
            className="font-extrabold !text-[#4D4EE0] hover:!text-[#4D4EE0] hover:underline"
            style={{ color: '#4D4EE0' }}
          >
            Razed.com
          </a>{" "}
          and{" "}
          <a
            href={luxdropUrl}
            target="blank"
            className="font-extrabold !text-[#1BB2FF] hover:!text-[#1BB2FF] hover:underline"
            style={{ color: '#1BB2FF' }}
          >
            Luxdrop.com
          </a>{" "}
          - the world&apos;s most known and trusted online casinos. From VIP
          perks to leaderboard races, milestones, events and daily giveaways, we&apos;ve got it
          all.
        </p>
      </div>
    </div>
  );
};

export default HomeBanner;
